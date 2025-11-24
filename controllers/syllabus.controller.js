const models = require('../models');
const ratingController = require('./rating.controller');
const errorController = require('./error.controller');
const dayjs = require('dayjs');

exports.getSyllabi = async (where) => {
  try {
    const options = {
      include: [
        {
          model: models.rating,
          attributes: ['id', 'label'],
        },
        {
          model: models.lesson,
          as: 'lessons',
        }
      ]
    };

    return (await models.syllabus
      .findAll({ where, ...options }))
      .map(syllabus => ({
        ...syllabus.dataValues,
        updatedAt: dayjs(syllabus.updatedAt).format('YYYY-MM-DD')
      }));
  } catch (err) {{
    const error = new Error('Could not fetch syllabi: ' + err);
    throw error;
  }}
}

exports.getSyllabusCreatePage = async (req, res, next) => {
  try {
    if (!req.query.entityId) {
      const error = new Error('Entity ID is required');
      error.statusCode = 422;
      throw error;
    }
    res.render('add-syllabus', {
      entityId: req.query.entityId,
      ratings: await ratingController.getRatings(),
    })
  } catch (err) {
    next(err);
  }
}

exports.createSyllabus = async (req, res, next) => {
  try {
    errorController.validationHandler(req, res);
    const { title, version, entityId, ratingId, lessons } = req.body;
    const newLessons = lessons.map(l => ({
      title: l.title,
      objective: l.objective,
      content: l.content,
      completion: l.completion,
    }));

    await models.syllabus.create(
      { title, version, ratingId, entityId, lessons: newLessons },
      { include: [{ model: models.lesson, as: 'lessons' }]}
    );

    res.redirect(`/entity/${entityId}`);
  } catch (err) {
    console.error(err);
    if (err.statusCode == 422) {
      this.getSyllabusCreatePage(req, res);
    } else {
      next(err);
    }
  }
}


exports.getUpdateSyllabusPage = async (req, res, next) => {
  try {
    const syllabi = await this.getSyllabi({ id: req.params.syllabusId });
    if (!syllabi.length) {
      const error = new Error('Could not find syllabus');
      error.statusCode = 404;
      throw error;
    }
    res.render('edit-syllabus', {
      syllabus: syllabi[0],
      ratings: await ratingController.getRatings(),
    })
  } catch (err) {
    next(err);
  }
}

exports.updateSyllabus = async (req, res, next) => {
  try {
    errorController.validationHandler(req, res);

    const { syllabusId, title, version, ratingId, entityId } = req.body;

    // Get the existing syllabus
    const syllabus = await models.syllabus.findByPk(syllabusId, {
      include: [{model: models.lesson, as: 'lessons' }],
    });

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

    return res.redirect(`/entity/${entityId}`);
  } catch (err) {
    next(err);
  }
}

exports.getLessonInfo = async (userId, lessonId) => {
  try {
    const lesson = await models.lesson.findByPk(lessonId, {
      include: [{
        model: models.userLesson,
        as: 'userLessons',
        where: { userId },
        required: false,
      }],
    });
    const plain = lesson.get({ plain: true });
    plain.userLesson = plain.userLessons[0] || {};
    return plain;
  } catch (err) {
    next(err);
  }
}

exports.saveLessonInfo = async (req, res, next) => {
  try {
    errorController.validationHandler(req, res);

    const { userId, lessonId } = req.params;
    const { status, notes }= req.body;

    const userLesson = await models.userLesson.findOne({ where: {
      userId,
      lessonId
    }});

    if (userLesson) {
      await userLesson.update({
        status,
        notes
      });
    } else {
      await models.userLesson.create({ userId, lessonId, status, notes });
    }

    res.redirect(`/student/${userId}`);

  } catch (err) {
    next(err);
  }
}
