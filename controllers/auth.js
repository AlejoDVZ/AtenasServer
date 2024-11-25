const db = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');



exports.login = async (req,res) =>{
  try{
  const peticion = req.body
  console.log('estas viendo la informacion de la peticion',peticion);
  console.log('');
  
  if (!req.body) {return res.status(400).json({ error: 'Cuerpo de la solicitud no proporcionado' });}

    const { email, password } = req.body;
    if (!email || !password) {return res.status(400).json({ error: 'Faltan username o password' }); }

    const [results] = await db.promise().query('SELECT p.name, p.lastname, p.id, p.email, p.password, p.role, dp.defensoria FROM personal as p INNER JOIN defensorias_personal as dp on dp.personal = p.id WHERE email = ? ', [email])
    if (results.length === 0) {
        return res.status(401).json({ error: 'Credenciales email inválido' })
      }
    const user = results[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciales contraseña inválida' })
      }

    console.log('estas viendo la informacion del usuario',user);
    const token = jwt.sign({id: user.id, name: [user.name,' ',user.lastname],defensoria: user.defensoria,role :user.role},'llavesecretauwu',{expiresIn:'1h'});
    res.json({ token, user: { id: user.id,name: [user.name,' ',user.lastname], email: user.email, role: user.role, defensoria: user.defensoria } })
    } catch (error) {
        console.error('Error en el login:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}
