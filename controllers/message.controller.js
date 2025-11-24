const { validationHandler } = require('../controllers/error.controller');
const models = require('../models');

/** Render the Contact Us page */
exports.getContactPage = (req, res) => {
  res.render('public/contact', {
    layout: '_layouts/public',
  });
}

/** Create message */
exports.createMessage = async (req, res, next) => {
  try {
    validationHandler(req, res);
    await models.message.create(req.body);
    req.flash('success', 'Message sent');
    res.redirect('/contact');
  } catch (err) {
    console.error(err);
    if (err.statusCode == 422) {
      this.getContactPage(req, res);
    } else {
      next(err);
    }
  }
}

exports.getAllMessages = async () => {
  return await models.message.findAll({
    where: {
      resolved: false,
    }
  });
}

exports.getMessagePage = async (req, res) => {
  validationHandler(req, res);
  const message = await models.message.findOne({
    where: {
      id: req.params.messageId
    }
  });
  res.render('message', { message });
}

exports.deleteMessage = async (req, res) => {
  validationHandler(req, res);
  await models.message.destroy({
    where: {
      id: req.params.messageId
    }
  });

  res.redirect('/dashboard');
}

exports.resolveMessage = async (req, res) => {
  validationHandler(req, res);
  await models.message.update(
    { resolved: true },
    {
      where: {
      id: req.params.messageId
    }
  });
  res.redirect('/dashboard');
}
