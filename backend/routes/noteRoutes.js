
const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

router.get('/member/:memberId', noteController.getNotesByMember);
router.post('/', noteController.createNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
