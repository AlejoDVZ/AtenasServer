const express = require('express');
const router = express.Router();
const usuarioController = require('./controllers/user')
const loginController =require('./controllers/auth')
const test = require('./controllers/test')
const admin = require('./controllers/admin')


router.get("/", function (req, res) {
    console.log("funcionando")
    let respuesta = "funcionando"
    res.send(
        respuesta    
    )
  });

router.post('/test/login',test.login);

router.post('/login', loginController.login);

router.get('/user/cases',usuarioController.cases)

router.post('/register/member',admin.NewMember)

module.exports = router;