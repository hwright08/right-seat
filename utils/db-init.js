// Load environment variables
require('dotenv').config({ quiet: true });

const db = require('./db');
const { hashPassword } = require('./authUtil');

const models = require('../models');
const associations =  require('../models/associations');

async function main() {
  console.log('Establishing associations...');
  // Establish the model relationships/associations
  associations();

  try {
    console.log('Force sync the database...');
    await db.sync({ force: true });

    // Initialize privileges
    console.log('Initialize Privileges...');
    await models.privilege.bulkCreate([
      { name: 'global' },
      { name: 'admin' },
      { name: 'cfi' },
      { name: 'student' },
    ]);

    // Initialize subscriptions
    console.log('Initialize Subscriptions...');
    await models.subscription.bulkCreate([
      {
        key: 'trial',
        label: 'Free Trial',
        description: 'Try RightSeat as a CFI for 14 days.',
        price: 0.00,
        requireSales: false
      },
      {
        key: 'single',
        label: 'CFI',
        description: 'Manage your syllabuses, add students, and track their progress.',
        price: 9.00,
        requireSales: false
      },
      {
        key: 'school',
        label: 'Flight School',
        description: `Manage multiple CFI's and Students`,
        price: 49.00,
        requireSales: false
      },
      {
        key: 'enterprise',
        label: 'Enterprise',
        description: `Manage multiple schools and their employees and students`,
        price: null,
        requireSales: true
      },
    ]);

    // Initialize the subscription features
    console.log('Initialize Subscription Features...');
    await models.subscriptionFeature.bulkCreate([
      // Free Trial
      { subscriptionId: 1, feature: '14 day free trial' },
      { subscriptionId: 1, feature: 'No credit card required' },
      { subscriptionId: 1, feature: 'Solo CFI plan' },

      // Single
      { subscriptionId: 2, feature: '1 instructor' },
      { subscriptionId: 2, feature: 'Up to 10 students' },
      { subscriptionId: 2, feature: 'Lesson Logging' },
      { subscriptionId: 2, feature: 'Printable progress' },

      // School
      { subscriptionId: 3, feature: `Up to 10 CFI's` },
      { subscriptionId: 3, feature: `Unlimited students` },
      { subscriptionId: 3, feature: `Syllabus versioning` },
      { subscriptionId: 3, feature: `Pass/Fail analytics` },

      // Enterprise
      { subscriptionId: 4, feature: `Audit exports` },
      { subscriptionId: 4, feature: `Priority Support` },
      { subscriptionId: 4, feature: `Onboarding help` },
    ]);

    // Initialize entities
    console.log('Initialize Entities...');
    await models.entity.bulkCreate([
      {
        name: 'Global Enterprise',
        phone: null,
        subscriptionId: 4
      },
      {
        name: 'Test Flight School',
        phone: null,
        subscriptionId: 3
      },
      {
        name: 'Test CFI',
        phone: null,
        subscriptionId: 2
      },
      {
        name: 'Free Trial',
        phone: null,
        subscriptionId: 1
      },
    ]);

    // Create test users and the global admin account
    console.log('Initialize test users...');
    await models.user.bulkCreate([
      // Global Admins
      {
        firstName: 'admin',
        lastName: 'admin',
        email: 'admin@example.com',
        passwrd: await hashPassword('globalAdmin'),
        privilegeId: 1,
        entityId: 1
      },
      // Local Admins
      {
        firstName: 'Test',
        lastName: 'Flight School',
        email: 'admin.flightschool@example.com',
        passwrd: await hashPassword('localAdmin'),
        privilegeId: 2,
        entityId: 2
      },
      // CFIs
      {
        firstName: 'Test',
        lastName: 'CFI1',
        email: 'cfi1@example.com',
        passwrd: await hashPassword('testcfi1'),
        privilegeId: 3,
        entityId: 2
      },
      {
        firstName: 'Test',
        lastName: 'CFI1',
        email: 'cfi1@example.com',
        passwrd: await hashPassword('testcfi1'),
        privilegeId: 2,
        entityId: 3
      },
      {
        firstName: 'Test1',
        lastName: 'Student',
        email: 'student1@example.com',
        passwrd: await hashPassword('student1'),
        privilegeId: 4,
        entityId: 2,
        cfiId: 3
      },
      {
        firstName: 'Test2',
        lastName: 'Student',
        email: 'student2@example.com',
        passwrd: await hashPassword('student2'),
        privilegeId: 4,
        entityId: 3,
        cfiId: 4
      },
    ]);

    console.log('DB Initialized!!!');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
