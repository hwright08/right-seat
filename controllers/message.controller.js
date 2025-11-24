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

/**
 * Get all unresolved messages
 * @returns All un-resolved messages
 */
exports.getAllMessages = async () => {
  try {
    return await models.message.findAll({
      where: {
        resolved: false,
      }
    });
  } catch (err) {
    const error = new Error('Could not fetch messages: ' + err);
    throw(error);
  }
}

/** Render a single message's page */
exports.getMessagePage = async (req, res, next) => {
  try {
    validationHandler(req, res);
    const message = await models.message.findOne({
      where: {
        id: req.params.messageId
      }
    });
    res.render('message', { message });
  } catch (err) {
    next(err);
  }
}

/** Delete a message */
exports.deleteMessage = async (req, res, next) => {
  try {
    validationHandler(req, res);
    await models.message.destroy({
      where: {
        id: req.params.messageId
      }
    });

    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
}

/** Resolve a message */
exports.resolveMessage = async (req, res, next) => {
  try {
    validationHandler(req, res);
    await models.message.update(
      { resolved: true },
      {
        where: {
        id: req.params.messageId
      }
    });
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
}
