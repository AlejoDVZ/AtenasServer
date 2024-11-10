const express = require('express');
const router = express.Router();

const usuarioController = require('./controllers/user')
const loginController =require('./controllers/auth')




router.get("/", function (req, res) {
    console.log("funcionando")
    let respuesta = {
        paramostar: "mamawicho", 
        script: "<script> console.log('mameluco') </script>"
    }
    res.send(
        respuesta    
    )
  });

router.get('/user',usuarioController.allusers);


router.post('/login', loginController.login);

module.exports = router;