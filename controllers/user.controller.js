const models = require('../models');
const entityController = require('./entity.controller');
const { validationHandler } = require('./error.controller');
const messageController = require('./message.controller');
const ratingController = require('./rating.controller');
const syllabusController = require('./syllabus.controller');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

exports.findUser = async (query) => {
  return await models.user.findOne({
    where: query,
    include: [{
      model: models.privilege,
      attributes: ['name'],
    }, {
      model: models.rating,
      attributes: ['id', 'label'],
    }, {
      model: models.syllabus,
      required: false,
    }]
  });
}

exports.getDashboard = async (req, res, next) => {
  try {
    // Render the correct dashboard
    const { privilege, entityId } = req.session.user;

    // Get the entity information
    res.locals.currentEntity = await entityController.getEntity(entityId);

    switch (privilege) {
      case 'global':
        const [
          allEntities,
          messages
        ] = await Promise.all([
          entityController.getAllEntities({ name: req.query.entity }),
          messageController.getAllMessages(),
        ]);
        return res.render('dashboard/global', {
          entities: allEntities,
          messages
        });
      case 'admin':
        req.params.entityId = req.session.user.entityId;
        return entityController.getEntityDashboard(req, res, next);3
      case 'cfi':
        req.params.userId = req.session.user.id;
        return this.getCfiDashboard(req, res, next);
      case 'student':
        req.params.userId = req.session.user.id;
        return this.getStudentDashboard(req, res, next);
      default:
        const error = new Error('User Privilege not recognized');
        error.statusCode = 403;
        throw error;
    }
  } catch (err) {
    next(err);
  }
}

exports.getCfiDashboard = async (req, res, next) => {
  try {
    if (!req.params.userId) {
      const error = new Error('User ID not found');
      error.statusCode = 404;
      throw error;
    }

    const user = await this.findUser({ id: req.params.userId });
    const cfis = [];

    const [
      currentEntity,
      students,
    ] = await Promise.all([
      entityController.getEntity(user.entityId),
      this.getUsers({ privilege: 'student', searchStr: req.query.student, includeCfi: true, includeSyllabus: true, cfiId: req.params.userId }),
    ]);

    let overallProgress = 0;
    for (const student of students) {
      const studentProgress = await this.getAvgStudentProgress(student.id);
      student.progress = studentProgress;

      overallProgress += studentProgress;
    }

    overallProgress /= students.length;

    res.render('dashboard/cfi', {
      currentEntity,
      students,
      cfis,
      profile: user,
      overallProgress,
      path: req.originalUrl,
      canEnrollStudent: false,
      canEditUser: ['global', 'admin'].includes(req.session.user.privilege),
    });

  } catch (err) {
    next(err);
  }
}

exports.getStudentDashboard = async (req, res, next) => {
  try {
    const profile = await this.findUser({ id: req.params.userId });
    const lessons = await this.getStudentLessons(req.params.userId);
    const progress = await  this.getAvgStudentProgress(req.params.userId);
    res.render('dashboard/student', {
      profile,
      lessons,
      progress,
      canEditUser: ['global', 'admin'].includes(req.session.user.privilege),
    });
  } catch (err) {
    next(err);
  }
}

exports.getUsers = async (where) => {
  try {
    const options = { include: [] };

    if (where.privilege) {
      const { id: privilegeId } = await models.privilege.findOne({ where: { name: where.privilege }});
      where.privilegeId = privilegeId;
      delete where.privilege;
    }
    if (where.includeCfi) {
      options.include.push({
        model: models.user,
        required: false,
        as: 'cfi',
      });
      delete where.includeCfi;
    }
    if (where.includeSyllabus) {
      options.include.push({
        model: models.syllabus,
        required: false,
      });
      delete where.includeSyllabus;
    }
    if (where.searchStr) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${where.searchStr.toLowerCase()}%` } },
        { lastName: { [Op.like]: `%${where.searchStr.toLowerCase()}%` } },
      ];
    }
    delete where.searchStr;
    return await models.user.findAll({ where, ...options });
  } catch (err) {
    const error = new Error('Could not fetch users: ' + err);
    throw(error);
  }
}

exports.getCreateUserPage = async (req, res, next) => {
  try {
    const { entityId, type } = req.query;
    if (!entityId) {
      const error = new Error('Entity ID is required');
      error.statusCode = '422';
      throw error;
    }
    if (!type) {
      const error = new Error('User type is required');
      error.statusCode = '422';
      throw error;
    }
    const [
      currentEntity,
      ratings
    ] = await Promise.all([
      entityController.getEntity(entityId),
      ratingController.getRatings(),
    ]);

    let cfis = [], syllabi = [];
    if (type === 'student') {
      cfis = await this.getUsers({ entityId, privilege: 'cfi', inactiveDate: null }),
      syllabi = await syllabusController.getSyllabi({ entityId });
    }

    res.render('add-user', {
      currentEntity,
      ratings,
      type: type.toUpperCase(),
      data: res.locals.data,
      cfis,
      syllabi,
    })
  } catch (err) {
    next(err);
  }
}

exports.createUser = async (req, res, next) => {
  try {
    validationHandler(req, res);

    const { type, firstName, lastName, email, hasGoldSeal, ratings, entityId, cfiId, syllabusId } = req.body;

    let privilegeId = 4; // student
    if (type.toLowerCase() === 'admin') privilegeId = 2;
    if (type.toLowerCase() === 'cfi') privilegeId = 3;

    const data = {
      firstName,
      lastName,
      email,
      hasGoldSeal: hasGoldSeal === 'true',
      privilegeId,
      entityId,
      cfiId,
      syllabusId
    };

    const user = await models.user.create(data);
    if (ratings && ratings.length) await user.setRatings(ratings);

    res.redirect(`/${type}/${user.id}`);

  } catch (err) {
    console.error(err);
    if (err.statusCode == 422) {
      res.status(err.statusCode).render('add-user', {
        type: req.body.type,
        data: req.body,
        currentEntity: await entityController.getEntity(req.body.entityId),
        ratings: await ratingController.getRatings(),
      });
    } else {
      next(err);
    }
  }
}

exports.getStudentLessons = async (userId) => {
  try {
    const user = await this.findUser({ id: userId });
    const lessons = await models.lesson.findAll({
      where: { syllabusId: user.syllabusId },
      include: [{
        model: models.userLesson,
        as: 'userLessons',
        where: { userId },
        required: false,
      }],
      order: [['id', 'asc']]
    });

    return lessons.map(lesson => {
      const plain = lesson.get({ plain: true });
      const userLesson = plain.userLessons[0] || {};
      return { ...plain, userLesson };
    });
  } catch (err) {
    const error = new Error('Could not get user lesson information');
    error.statusCode = 404;
    throw err;
  }
}


exports.getAvgStudentProgress = async (userId) => {
  try {
    const lessons = await this.getStudentLessons(userId);
    if (!lessons.length) return 0;
    return lessons.reduce((sum, lesson) => {
      if (lesson.userLesson.status == 'completed') return sum += 1;
      if (lesson.userLesson.status == 'in-progress') return sum += 0.5;
      return sum;
    }, 0) / lessons.length * 100;
  } catch (err) {
    const error = new Error('Could not get user lesson information');
    error.statusCode = 404;
    throw err;
  }
}

exports.deactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await this.findUser({ id: userId });
    user.update({
      inactiveDate: dayjs().format('YYYY-MM-DD'),
    });
    res.redirect(`/entity/${user.entityId}`);
  } catch (err) {
    next(err);
  }
}

exports.reactivateUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await this.findUser({ id: userId });
    user.update({ inactiveDate: null });
    res.redirect(`/entity/${user.entityId}`);
  } catch (err) {
    next(err);
  }
}


exports.getEditUserPage = async (req, res, next) => {
  try {
    const user = await this.findUser({ id: req.params.userId });
    const ratings = await ratingController.getRatings();
    const currentEntity = await entityController.getEntity(user.entityId);
    user.ratings = user.ratings.map(r => `${r.id}`);

    let cfis = [], syllabi = [];
    if (user.privilege.name === 'student') {
      cfis = await this.getUsers({ entityId: user.entityId, privilege: 'cfi', inactiveDate: null })
      syllabi = await syllabusController.getSyllabi({ entityId: user.entityId });
    }
    res.render('add-user', {
      currentEntity,
      ratings,
      type: user.privilege.name.toUpperCase(),
      data: user,
      cfis,
    })
  } catch (err) {
    next(err);
  }
}


exports.updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type, firstName, lastName, email, hasGoldSeal, ratings, cfiId, syllabusId } = req.body;
    const data = {
      firstName,
      lastName,
      email,
      hasGoldSeal: hasGoldSeal === 'true',
      cfiId,
      syllabusId,
    }

    const user = await this.findUser({ id: userId });
    await user.update(data, { where: { id: userId }});

    if (Array.isArray(ratings)) {
      await user.setRatings([]);
      await user.setRatings(ratings);
    } else {
      await user.setRatings([])
    }

    return res.redirect(`/${type}/${userId}`);
  } catch (err) {
    if (err.statusCode == 422) {
      res.status(err.statusCode).render('add-user', {
        type: req.body.type,
        data: req.body,
        currentEntity: await entityController.getEntity(req.body.entityId),
        ratings: await ratingController.getRatings(),
      });
    } else {
      next(err);
    }
  }
}

exports.getLessonPage = async (req, res, next) => {
  try {
    const { userId, lessonId } = req.params;
    const profile = await this.findUser({ id: userId });
    const lesson = await syllabusController.getLessonInfo(userId, lessonId);
    res.render('lesson', {
      profile,
      lesson,
     });
  } catch (err) {
    next(err);
  }
}
