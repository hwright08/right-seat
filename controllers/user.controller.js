const models = require('../models');
const entityController = require('./entity.controller');
const { validationHandler } = require('./error.controller');
const messageController = require('./message.controller');
const ratingController = require('./rating.controller');
const syllabusController = require('./syllabus.controller');
const quoteController = require('./quote.controller');

const { Op } = require('sequelize');
const dayjs = require('dayjs');

/**
 * Find a user by specifying the where clause. Will also include privilege, rating, and syllabus details.
 * @param {object} query - The where clause on the user model
 * @returns A user with the specified criteria
 */
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

/** Routes a user to the appropriate dashboard */
exports.getDashboard = async (req, res, next) => {
  try {
    // Render the correct dashboard
    const { privilege, entityId } = req.session.user;

    // Get the entity information
    res.locals.currentEntity = await entityController.getEntity(entityId);

    // Determine which dashboard should be rendered.
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

/** Render the CFI Dashboard */
exports.getCfiDashboard = async (req, res, next) => {
  try {
    if (!req.params.userId) {
      const error = new Error('User ID not found');
      error.statusCode = 404;
      throw error;
    }

    // Get the user's data
    const user = await this.findUser({ id: req.params.userId });

    // Get any associated data the user would see on their dash
    const [
      currentEntity,
      students,
    ] = await Promise.all([
      entityController.getEntity(user.entityId),
      this.getUsers({ privilege: 'student', searchStr: req.query.student, includeCfi: true, includeSyllabus: true, cfiId: req.params.userId }),
    ]);

    // Calculate student progress averages
    let overallProgress = 0;
    for (const student of students) {
      const studentProgress = await this.getAvgStudentProgress(student.id);
      student.progress = studentProgress;
      overallProgress += studentProgress;
    }
    overallProgress /= students.length;

    // Render the dashboard
    res.render('dashboard/cfi', {
      currentEntity,
      students,
      cfis: [],
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

/** Render the student dashboard */
exports.getStudentDashboard = async (req, res, next) => {
  try {
    const profile = await this.findUser({ id: req.params.userId });
    const lessons = await this.getStudentLessons(req.params.userId);
    const progress = await  this.getAvgStudentProgress(req.params.userId);
    const quote = await quoteController.getRandomQuote();

    res.render('dashboard/student', {
      profile,
      lessons,
      progress,
      quote,
      canEditUser: ['global', 'admin'].includes(req.session.user.privilege),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get users specified by where clause - will add additional information based on query
 * @param {object} where - The where clause for the users model
 * @param {string} [where.privilege] - The user's privilege key - will translate to an ID
 * @param {boolean} [where.includeCfi] - Determines if the user's CFI data should be included
 * @param {boolean} [where.includeSyllabus] - Determines if the user's syllabus data should be included
 * @param {string} [where.searchStr] - Used to search for a user by name
 * @param {*} [where.*] - Any other search field tied to the users model
 * @returns Users specified by the where clause
 */
exports.getUsers = async (where) => {
  try {
    const options = { include: [] };

    // If privilege is provided, find users with said privilege
    if (where.privilege) {
      const { id: privilegeId } = await models.privilege.findOne({ where: { name: where.privilege }});
      where.privilegeId = privilegeId;
      delete where.privilege;
    }
    // If includeCfi, get the CFI's information
    if (where.includeCfi) {
      options.include.push({
        model: models.user,
        required: false,
        as: 'cfi',
      });
      delete where.includeCfi;
    }
    // If includeSyllabus, get the syllabus information
    if (where.includeSyllabus) {
      options.include.push({
        model: models.syllabus,
        required: false,
      });
      delete where.includeSyllabus;
    }
    // Search for a user by name
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

/** Render the create user page */
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

    // We only care about CFI's and Syllabi's if the user is a student
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

/** Create a new user */
exports.createUser = async (req, res, next) => {
  try {
    validationHandler(req, res);

    // pull out the data
    const { type, firstName, lastName, email, hasGoldSeal, ratings, entityId, cfiId, syllabusId } = req.body;

    // Assign the correct privilege ID
    let privilegeId = 4; // student
    if (type.toLowerCase() === 'admin') privilegeId = 2;
    if (type.toLowerCase() === 'cfi') privilegeId = 3;

    // Make sure the user data is formatted correctly
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

    // Create the user and assign the ratings.
    const user = await models.user.create(data);
    if (ratings && ratings.length) await user.setRatings(ratings);

    // Redirect to that user's profile page
    res.redirect(`/${type.toLowerCase()}/${user.id}`);

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

/**
 * Get all lessons and associated data for a user and their assigned syllabus
 * @param {number} userId - The user ID we want the lessons for
 * @returns All lessons for a user
 */
exports.getStudentLessons = async (userId) => {
  try {
    // Get the user for the syllabus ID
    const user = await this.findUser({ id: userId });

    // Get the lessons tied to the syllabusID and "left join" all of the userLessons tied to it
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

    // Make sure the userLesson is it's own object and not an array for easier access
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

/**
 * Get the percent of lessons complete for a student
 * @param {number} userId - The user ID
 * @returns The average % complete for the student
 */
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

/** Deactivate a user */
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

/** Reactivate a user */
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

/** Render the edit user page */
exports.getEditUserPage = async (req, res, next) => {
  try {
    // Get the user data and drop down items
    const user = await this.findUser({ id: req.params.userId });
    const ratings = await ratingController.getRatings();
    const currentEntity = await entityController.getEntity(user.entityId);
    user.ratings = user.ratings.map(r => `${r.id}`);

    // We only care about cfi and syllabi info for students
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

/** Update a user's data */
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

    // Save the base user data
    const user = await this.findUser({ id: userId });
    await user.update(data, { where: { id: userId }});

    // Save the user's ratings
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

/** Get an individual lesson's page */
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
