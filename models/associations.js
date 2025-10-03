const models = require('./index');

module.exports = () => {
  // User / Privilege Relationship
  models.privilege.hasMany(models.user);
  models.user.belongsTo(models.privilege);

  // User / Entity Relationship
  models.entity.hasMany(models.user);
  models.user.belongsTo(models.entity);

  // Subscription / Feature Relationship
  models.subscription.hasMany(models.subscriptionFeature, {
    as: 'features',
    onDelete: 'CASCADE',
  });
  models.subscriptionFeature.belongsTo(models.subscription);

  // Entity / Subscription Relationship
  models.subscription.hasMany(models.entity);
  models.entity.belongsTo(models.subscription);

  //
}
