const models = require('./index');

module.exports = () => {
  // User / Privilege Relationship
  models.privilege.hasMany(models.user, { allowNull: false });
  models.user.belongsTo(models.privilege, { allowNull: false });

  // User / Entity Relationship
  models.entity.hasMany(models.user, { allowNull: false });
  models.user.belongsTo(models.entity, { allowNull: false });

  // Subscription / Feature Relationship
  models.subscription.hasMany(models.subscriptionFeature, {
    as: 'features',
    onDelete: 'CASCADE',
    allowNull: false
  });
  models.subscriptionFeature.belongsTo(models.subscription, { allowNull: false });

  // Entity / Subscription Relationship
  models.subscription.hasMany(models.entity, { allowNull: false });
  models.entity.belongsTo(models.subscription, { allowNull: false });

  // Student / CFI Relationship
  models.user.hasMany(models.user, {
    as: 'students',
    foreignKey: 'cfiId',
    allowNull: false
  });
  models.user.belongsTo(models.user, {
    as: 'cfi',
    foreignKey: 'cfiId',
    allowNull: false
  });

  // User / Rating Relationship
  models.rating.belongsToMany(models.user, { through: 'userRating' });
  models.user.belongsToMany(models.rating, { through: 'userRating' });

  // Syllabus / Rating Relationship
  models.rating.hasMany(models.syllabus);
  models.syllabus.belongsTo(models.rating);

  // Syllabus / Entity Relationship
  models.entity.hasMany(models.syllabus);
  models.syllabus.belongsTo(models.entity);

  // Syllabus / Lesson Relationship
  models.syllabus.hasMany(models.lesson, {
    as: 'lessons',
    foreignKey: { name: 'syllabusId', allowNull: false },
    onDelete: 'CASCADE'
  });
  models.lesson.belongsTo(models.syllabus, {
    as: 'syllabus',
    foreignKey: 'syllabusId',
  });

  // Syllabus / Student Relationship
  models.syllabus.hasMany(models.user);
  models.user.belongsTo(models.syllabus);

  // Lesson / Student Relationship
  models.user.belongsToMany(models.lesson, {
    through: models.userLesson,
    foreignKey: 'userId',
    otherKey: 'lessonId',
    as: 'lessons',
  });
  models.lesson.belongsToMany(models.user, {
    through: models.userLesson,
    foreignKey: 'lessonId',
    otherKey: 'userId',
    as: 'students',
  });

  models.userLesson.belongsTo(models.user, { foreignKey: 'userId' });
  models.userLesson.belongsTo(models.lesson, { foreignKey: 'lessonId' });
  models.user.hasMany(models.userLesson, { as: 'userLessons', foreignKey: 'userId' });
  models.lesson.hasMany(models.userLesson, { as: 'userLessons', foreignKey: 'lessonId' });
}
