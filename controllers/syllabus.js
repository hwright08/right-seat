const models = require('../models');
const { getRatings } = require('./rating');
const dayjs = require('dayjs');
const { fn } = require('sequelize');


// ----------------------------------
// LOGIC
// ----------------------------------

/**
 * Get all Syllabuses for a specific entity
 * @param {number} entityId - The ID of the entity
 * @param {object} [searchCriteria] - Any search criteria
 */
exports.getAllSyllabuses = async (entityId, searchCriteria = {}) => {
  const syllabuses = await models.syllabus.findAll({
    where: {
      entityId
    },
    include: [
      {
        model: models.rating,
        attributes: ['label']
      }
    ]
  });

  const updatedSyllabuses = [];
  for (let syllabus of syllabuses) {
      const updatedAt = dayjs(syllabus.updatedAt).format('YYYY-MM-DD');
      const lessonCount = await models.lesson.count({
        where: { syllabusId: syllabus.id }
      });
      updatedSyllabuses.push({
        ...syllabus.dataValues,
        updatedAt,
        lessonCount
      });
  }

  return updatedSyllabuses;
}


// ----------------------------------
// RENDER VIEWS
// ----------------------------------

exports.getCreateSyllabusPage = async (req, res) => {
  const ratings = await getRatings();
  res.render('syllabus', {
    entityId: req.params.entityId,
    ratings,
  });
}


// ----------------------------------
// CREATE/UPDATE
// ----------------------------------

exports.createSyllabus = async (req, res) => {
  const { entityId } = req.params;

  try {
    await models.syllabus.create(
      { ...req.body, entityId },
      { include: [{ model: models.lesson, as: 'lessons' }] });
    res.redirect(`/dashboard/${entityId}`);

  } catch (err) {
    console.error(err);
    res.locals.message = `Could not create the syllabus.`,
    res.locals.errors = err.errors;
    res.locals.data = req.body;
    return await this.getCreateSyllabusPage(req, res);
  }
}
