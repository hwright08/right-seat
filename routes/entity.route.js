/** @module routes/entity */

const express = require('express');

const entityController = require('../controllers/entity');

const router = express.Router();

router.get('/create', entityController.getCreateEntityPage);
router.post('/create', entityController.postCreateEntity);
router.post('/:entityId/subscription', entityController.postUpdateSubscription);

module.exports = router;
