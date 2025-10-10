const Sequelize = require('sequelize');

// Initialize our database connection
// Variables can be found in the .env file
const db = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    logging: false,
  }
);

// Global hook to trim all string and text fields
db.addHook('beforeValidate', (instance) => {
  if (!instance?.constructor?.rawAttributes) return;

  const attributes = instance.constructor.rawAttributes;

  for (const [fieldName, fieldDefinition] of Object.entries(attributes)) {
  const value = instance.getDataValue(fieldName);
    const type = fieldDefinition.type.key;

    if (['STRING', 'TEXT'].includes(type) && typeof value === 'string') {
      instance.setDataValue(fieldName, value.trim());
    }
  }
});

module.exports = db;
