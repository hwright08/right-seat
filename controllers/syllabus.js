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
 * @param {number} [searchCriteria.syllabusId] - Get a syllabus by ID
 */
exports.getAllSyllabuses = async (entityId, searchCriteria = {}) => {
  const whereObject = { entityId };
  const includes = [{
    model: models.rating,
    attributes: ['label', 'id']
  }];

  if (searchCriteria.syllabusId) {
    whereObject.id = searchCriteria.syllabusId;
  }

  if (searchCriteria.includeLessons) {
    includes.push({ model: models.lesson, as: 'lessons' });
  }

  const syllabuses = await models.syllabus.findAll({
    where: whereObject,
    include: includes
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

exports.getUpdateSyllabusPage = async (req, res) => {
  const { entityId, syllabusId } = req.params;
  const ratings = await getRatings();
  const syllabus = (await this.getAllSyllabuses(entityId, { syllabusId, includeLessons: true }))[0];
  res.render('edit-syllabus', {
    ratings,
    syllabus,
    entityId
  });
}


// ----------------------------------
// CREATE/UPDATE
// ----------------------------------

exports.createSyllabus = async (req, res) => {
  const { entityId } = req.params;
  const { title, version, ratingId, lessons } = req.body;

  newLessons = lessons.map(l => ({
    title: l.title,
    objective: l.objective,
    content: l.content,
    completion: l.completion,
  }));

  try {
    await models.syllabus.create(
      { title, version, ratingId, entityId, lessons: newLessons },
      { include: [{ model: models.lesson, as: 'lessons' }] }
    );
    res.redirect(`/dashboard/${entityId}`);

  } catch (err) {
    console.error(err);
    res.locals.message = `Could not create the syllabus.`,
    res.locals.errors = err.errors;
    res.locals.data = req.body;
    return await this.getCreateSyllabusPage(req, res);
  }
}


exports.updateSyllabus = async (req, res) => {
  const { entityId, syllabusId } = req.params;

  try {
    // Get the existing syllabus
    const syllabus = await models.syllabus.findByPk(syllabusId, {
      include: [{model: models.lesson, as: 'lessons' }],
    });

    // pull out the syllabus data
    const { title, version, ratingId } = req.body;

    // If a new version, create a new version
    if (parseFloat(version) > syllabus.version) {
      return this.createSyllabus(req, res);
    }

    // Update the existing syllabus
    await syllabus.update({ title, version, ratingId });

    // Handle lessons
    const { lessons } = req.body;

    // Get the different scenarios to update lessons
    const existingIds = syllabus.lessons.map(l => l.id);
    const updatedLessons = lessons.filter(l => !!l.id).map(l => l.id);
    const removedLessons = [...existingIds].filter(id => !updatedLessons.includes(id));

    // Delete removed lessons
    if (removedLessons.length) {
      await models.lesson.destroy({ where: { id: removedLessons, syllabusId }});
    }

    // Upsert remaining lessons
    if (lessons.length) {
      const formattedLessons = lessons.map(l => ({
        id: l.id ?? null,
        syllabusId,
        title: l.title,
        objective: l.objective,
        content: l.content,
        completion: l.completion,
      }));

      const updatableColumns = ['title', 'objective', 'content', 'completion'];

      await models.lesson.bulkCreate(formattedLessons, {
        updateOnDuplicate: updatableColumns
      });
    }

    return res.redirect(`/dashboard/${entityId}`);

  } catch (err) {
    console.error(err);
    res.locals.message = 'Could not update syllabus';
    res.locals.errors = err.errors;
    res.locals.data = req.body;
    return await this.getUpdateSyllabusPage(req, res);
  }
}
