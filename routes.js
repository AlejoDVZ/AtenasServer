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
router.get('/common/roles',common.roles);
router.get('/common/prefix',common.phonePrefix);

router.get('/allmembers',admin.MemberList)

router.post('/check',usuarioController.checkcase);
router.post('/check/personal',);

router.post('/register/newcase',usuarioController.newcase)
router.post('/register/defendant',usuarioController.newdefendant)
router.post('/register/member',admin.NewMember);

router.post('/test/register/:stablisment',test.insert)
router.post('/test/checkcase',test.checkcase);

module.exports = router;