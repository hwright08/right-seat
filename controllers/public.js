const SubscriptionModel = require('../models/subscription.model');
const SubscriptionFeatureModel = require('../models/subscription-feature.model');
// const User = require('../models/user.model');
// const Entity = require('../models/entity.model');

const LAYOUT = '_layouts/public';

exports.getIndexPage = async (req, res) => {
  try {
    const subscriptions = await SubscriptionModel.findAll({
      include: [{
        model: SubscriptionFeatureModel,
        as: 'features',
        attributes: ['id', 'feature']
      }],
    });

    res.render('public/index', {
      layout: LAYOUT,
      pageTitle: 'Flight Training Management',
      path: '/',
      subscriptions,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading subscriptions: ' + err);
  }
}


// exports.getSignUpPage = (req, res) => {
//   Subscription
//     .fetchAll()
//     .then(([subscriptions]) => {
//       res.render('public/sign-up', {
//         layout: LAYOUT,
//         pageTitle: 'Sign Up',
//         path: '/sign-up',
//         subscriptions: subscriptions.filter(sub => sub.subscription_key != 'enterprise'),
//       });
//     })
// }


// exports.getLoginPage = (req, res) => {
//   res.render('public/login', {
//     layout: LAYOUT,
//     pageTitle: 'Login',
//     path: '/login',
//   });
// }


// exports.getContactPage = (req, res) => {
//   res.render('public/contact', {
//     layout: LAYOUT,
//     pageTitle: 'Contact Us',
//     path: '/contact',
//   })
// }


// exports.postSignUp = (req, res) => {
//   console.log('body', req.body);
//   // Create the entity
//   // const { }
//   // const entity = new Entity(null, )

//   // Define the privilege

//   // Create the user
//   res.redirect('/');
// }
