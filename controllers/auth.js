const db = require('../db')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const hashPassword = (password) =>  //hashea la contraseña
  {
      return crypto.createHash('sha1').update(password).digest('hex');
  }

exports.login = (req,res) =>{
  
  const peticion = req.body
  console.log('estas viendo la informacion de la peticion',peticion);
  console.log('');
  
  if (!req.body) {return res.status(400).json({ error: 'Cuerpo de la solicitud no proporcionado' });}
   const { username, password } = req.body;
  if (!username || !password) {return res.status(400).json({ error: 'Faltan username o password' }); }

  const hashedPassword = hashPassword(password);                        
 
  db.query('SELECT * FROM users WHERE user = ? AND password = ?', [username, hashedPassword], (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Error al realizar la consulta' });
      }

      if (results.length === 0) {
          return res.status(401).json({ valid: false }); // Credenciales inválidas
      }
      const user = results[0];
      console.log('estas viendo la informacion del usuario',user);
      const token = jwt.sign({id: user.id, name: user.user,defensoria : user.defensoria},'llavesecretauwu',{expiresIn:'1h'});
      res.json({token}); 
  });
}
