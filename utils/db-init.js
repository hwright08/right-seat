// Load environment variables
require('dotenv').config({ quiet: true });
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const db = require('./db');
const models = require('../models');
const associations =  require('../models/associations');

const syllabusData = require('../data/syllabuses.json');
const entityData = require('../data/entities.json');

async function main() {

  console.log('Establishing associations...');
  // Establish the model relationships/associations
  associations();

  try {
    console.log('Set up session store');
    const store = new SequelizeStore({ db });
    store.sync({ force: true });

    console.log('Force sync the database...');
    await db.sync({ force: true });

    // Initialize Ratings
    console.log('Initialize Ratings...');
    await models.rating.bulkCreate(require('../data/ratings.json'));

    // Initialize privileges
    console.log('Initialize Privileges...');
    await models.privilege.bulkCreate(require('../data/privileges.json'));

    // Initialize subscriptions
    console.log('Initialize Subscriptions...');
    await models.subscription.bulkCreate(require('../data/subscriptions.json'));

    // Initialize the subscription features
    console.log('Initialize Subscription Features...');
    await models.subscriptionFeature.bulkCreate(require('../data/subscriptionFeatures.json'));

    // Initialize entities
    console.log('Initialize Entities...');
    await models.entity.bulkCreate(entityData);

    // Create initial syllabus
    console.log('Initialize Syllabuses');
    const entities = await models.entity.findAll();
    for (const entity of entities) {
      await models.syllabus.bulkCreate(syllabusData.map(sy => ({ ...sy, entityId: entity.id })), { include: [{ model: models.lesson, as: 'lessons' }]});
    }

    // Create test users and the global admin account
    console.log('Initialize Users...');
    await models.user.bulkCreate(require('../data/users.json'), { individualHooks: true, validate: true });

    // Initialize students
    await models.user.bulkCreate(require('../data/students.json'), { individualHooks: true, validate: true });


    // Create some messages
    console.log('Initialize messages...');
    await models.message.bulkCreate(require('../data/messages.json'));

    console.log('DB Initialized!!!');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
