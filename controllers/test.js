const { json } = require('body-parser');
const db = require('../db')
const crypto = require('crypto');

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
      console.log(user);
      res.json(user); 
  });}
      
exports.allusers = (req,res) =>{
    db.query('SELECT * FROM users', (error, results) => {
    if (error) throw error;
    res.status(200).json(results);
    });
}
exports.insert = (req,res) =>{
    const stablisment = req.params.stablisment;
    db.query('INSERT INTO stablisments (id,name) values (NULL,?)',stablisment,(error,results)=>{
        if (error) throw error;
        if (error) {
            return res.status(500).json({ error: 'Error al realizar la consulta' });
        }
    console.log('todo piola')
    res.status(200).json({id:results.insertId})
    })
}
exports.checkcase = (req,res) => {
const numc = req.body.numberCausa;
console.log(numc);

  if (!numc || numc === null) {
    return res.status(400).json({ error: 'El número de causa es obligatorio.' });
  }
  
  db.query("SELECT causas.id FROM causas_states INNER JOIN causas ON causas.id = causas_states.causa WHERE causas.numberCausa = ? ",[numc],(error,results)=>{
    if (error) throw error;
    if (results.length === 0){
        return res.status(404)
    }
    console.log(results[0]);
    res.status(200).json(results[0]);
  })
}