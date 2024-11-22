const { json } = require('body-parser');
const db = require('../db')
const crypto = require('crypto');
const mysql = require('mysql2/promise')
const bcrypt =require('bcrypt');


const db2 = mysql.createPool({
  host: "localhost",
  port:3306,
  user: "root",
  password: "",
  database: "atenasdb",
});
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
exports.resgitertest = async (req,res) => {
  const { name, lastname, document, typeDocument, role, email, phone, password} = req.body;
  console.log(req.body);
  const requiredFields = { name, lastname, document, typeDocument, role, email, phone,password };
  const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({ message: `Faltan los siguientes campos: ${missingFields.join(', ')}` });
  }
  const connection = await db2.getConnection();
  try {

    await connection.beginTransaction(); // Iniciar una transacción
    // Verificar si el usuario ya existe
    const [existingUser ] = await connection.query('SELECT * FROM personal WHERE document = ?', [document]);
    if (existingUser .length > 0) {
      return res.status(400).json({ message: 'El personal ya está registrado' });
    }
    // Verificar si el correo ya existe
    const [existingEmail] = await connection.query('SELECT * FROM personal WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }
    // Verificar si el teléfono ya existe
    const [existingPhone] = await connection.query('SELECT * FROM phones WHERE number = ?', [phone]);
    if (existingPhone.length > 0) {
      return res.status(400).json({ message: 'El teléfono ya está registrado' });
    }
    // Insertar el nuevo usuario
    const hashedPassword = await bcrypt.hash(password,10)
    const [userResult] = await connection.query('INSERT INTO personal (name, lastname, typeDocument, document, role, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [name, lastname, typeDocument, document, role, email, hashedPassword]);
    const userId = userResult.insertId;
    
    // Insertar el teléfono
    const [phoneResult] = await connection.query('INSERT INTO phones (number) VALUES (?)', [phone]);
    const phoneId = phoneResult.insertId;
    // Relacionar el usuario con el teléfono
    await connection.query('INSERT INTO phone_personal (personal, phone) VALUES (?, ?)', [userId, phoneId]);
    // Confirmar la transacción
    await connection.commit();
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    // Revertir la transacción en caso de error
    await connection.rollback();
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario' });
    connection.release();
  } finally {
    connection.release(); // Liberar la conexión
  }
}