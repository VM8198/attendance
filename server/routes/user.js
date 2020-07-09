var express = require('express');

var userController = require('../controllers/user.controller');

var router = express.Router();


router.post('/signup' , userController.signUp); 
router.post('/login' , userController.login);
router.post('/get-users' , userController.getUsers);
router.get('/get-user-by-id/:id' , userController.getUserById);
router.put('/update-user-by-id/:id' , userController.updateUserById);
router.delete('/delete-user-by-id/:id' , userController.deleteUserById); 

module.exports = router;
