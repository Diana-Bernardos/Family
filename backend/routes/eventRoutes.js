
// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/family', eventController.getFamilyEvents);
router.get('/member/:memberId', eventController.getMemberEvents);
router.get('/type/:activity_type', eventController.getEventsByType);
router.get('/upcoming', eventController.getUpcomingEvents);
router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;