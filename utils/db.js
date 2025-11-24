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
    const type = fieldDefinition?.type?.key;

    // Trim all strings before going into the database
    if (typeof value === 'string' && ['STRING', 'TEXT'].includes(type)) {
      let trimmedVal = value?.trim();
      if (trimmedVal === '') trimmedVal = null;
      instance.setDataValue(fieldName, trimmedVal);
    }
  }
});

module.exports = db;
