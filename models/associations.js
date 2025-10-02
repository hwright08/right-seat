const models = require('./index');

module.exports = () => {
  models.user.belongsTo(models.privilege);
  models.user.belongsTo(models.entity);

  models.subscription.hasMany(models.subscriptionFeature, {
    as: 'features',
    foreignKey: 'subscriptionId',
    onDelete: 'CASCADE',
  });
  models.subscriptionFeature.belongsTo(models.subscription, {
    as: 'subscription',
    foreignKey: 'subscriptionId',
  });

  models.entity.belongsTo(models.subscription, { foreignKey: 'subscriptionId' });
}
