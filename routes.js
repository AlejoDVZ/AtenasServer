const express = require('express');
const router = express.Router();
const usuarioController = require('./controllers/user')
const loginController =require('./controllers/auth')
const test = require('./controllers/test')
const admin = require('./controllers/admin')
const common = require('./controllers/commomdata')


router.get("/", function (req, res) {
    console.log("funcionando")
    let respuesta = "funcionando"
    res.send(
        respuesta    
    )
  });

router.post('/test/login',test.login);

router.post('/login', loginController.login);

router.post('/user/cases',usuarioController.cases);

router.get('/common/doctype',common.documentype);
router.get('/common/education',common.educationlevel);
router.get('/common/status',common.statuscase);

router.post('/cases/:numbercausa',usuarioController.checkcase);

router.post('/register/member',admin.NewMember);

module.exports = router;