const express = require('express');
const router = express.Router();
const usuarioController = require('./controllers/user')
const loginController =require('./controllers/auth')
const test = require('./controllers/test')
const admin = require('./controllers/admin')
const common = require('./controllers/commomdata')
const casesInventoryController = require('./controllers/datatable');
const error = require('./controllers/errors')

router.get("/", function (req, res) {
    console.log("funcionando")
    let respuesta = "funcionando"
    res.send(
        respuesta    
    )
  });

router.post('/login', loginController.login);
                                                      //datacomun
router.get('/common/doctype',common.documentype);
router.get('/common/education',common.educationlevel);
router.get('/common/status',common.statuscase);
router.get('/common/roles',common.roles); 
router.get('/common/defensorias',common.defensorias)
router.get('/common/fiscalias',common.fiscalias);
router.get('/common/detentioncenters',common.detentioncenters);
router.get('/common/calificaciones',common.calificaciones);

router.post('/cases-inventory', casesInventoryController.getCasesInventory);
router.post('/proceedings', casesInventoryController.getProceedings);
router.post('/case-statistics', casesInventoryController.getCaseStatistics);

router.post('/check',usuarioController.checkcase);
router.post('/cases',usuarioController.cases);
router.post('/actuaciones',usuarioController.proceedings)
router.post('/defendants', usuarioController.defendants);
router.post('/update-defendant', usuarioController.updateDefendant);
router.post('/update-status', usuarioController.updateStatus);
router.post('/report',usuarioController.newProceedingWithFile, usuarioController.newproceeding );
router.post('/register/newcase',usuarioController.newcase)
router.post('/download',usuarioController.downloadDOc);

                                                                //crud admin
router.get('/allmembers',admin.MemberList)                                                                

router.post('/register/member',admin.NewMember);
router.post('/register/defensoria',admin.NewDefensoria);

router.delete('/delete/defensoria',admin.DeleteDefensoria)
router.delete('/delete/personal',admin.DeletePersonal)

router.put('/update/password',admin.UpdatePassword)
router.put('/update/personal/:id',admin.UpdatePersonal)
                                                                  //tests
router.post('/test/login',test.login);
router.post('/test/register/:stablisment',test.insert)
router.post('/test/checkcase',test.checkcase);
router.post('/test',test.resgitertest)

module.exports = router;