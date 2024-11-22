const express = require('express');
const router = express.Router();
const usuarioController = require('./controllers/user')
const loginController =require('./controllers/auth')
const test = require('./controllers/test')
const admin = require('./controllers/admin')
const common = require('./controllers/commomdata')
const error = require('./controllers/errors')


router.get("/", function (req, res) {
    console.log("funcionando")
    let respuesta = "funcionando"
    res.send(
        respuesta    
    )
  });

router.post('/test/login',test.login);

router.post('/login', loginController.login);

router.post('/cases',usuarioController.cases);
router.post('/actuaciones',usuarioController.proceedings)

router.get('/common/doctype',common.documentype);
router.get('/common/education',common.educationlevel);
router.get('/common/status',common.statuscase);
router.get('/common/roles',common.roles); 
router.get('/common/defensorias',common.defensorias)
router.get('/common/fiscalias',common.fiscalias);
router.get('/common/detentioncenters',common.detentioncenters);

router.get('/allmembers',admin.MemberList)

router.post('/check',usuarioController.checkcase);
router.post('/check/personal',);

router.post('/register/newcase',usuarioController.newcase)
router.post('/register/member',admin.NewMember);
router.post('/register/defensoria',admin.NewDefensoria);

router.delete('/delete/defensoria',admin.DeleteDefensoria)
router.delete('/delete/personal',admin.DeletePersonal)

router.put('/update/personal/:id',admin.UpdatePersonal)

router.post('/test/register/:stablisment',test.insert)
router.post('/test/checkcase',test.checkcase);
router.post('/test',test.resgitertest)

module.exports = router;