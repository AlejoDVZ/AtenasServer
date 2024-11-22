const { query } = require('express');
const db = require('../db')
const mysql = require('mysql2/promise')
const bcrypt = require('bcrypt')

const db2 = mysql.createPool({
    host: "localhost",
    port:3306,
    user: "root",
    password: "",
    database: "atenasdb",
  });
exports.MemberList = (req,res) => {
  const query ='SELECT p.id, p.name, p.lastname, p.typeDocument, p.document, roles.role as role, p.email, phones.number FROM personal AS p INNER JOIN phone_personal ON phone_personal.personal = p.id INNER JOIN phones ON phone_personal.phone = phones.id INNER JOIN roles ON roles.id = p.role;'
  db.query(query,(error,results) =>{
    if (error) throw error;
    res.status(200).json(results);
    console.log(results);
});
}
exports.NewMember = async (req,res) => {
  const { name, lastname, document, typeDocument, role, email, number, password, defensoria} = req.body;
  console.log(req.body);
  const requiredFields = { name, lastname, document, typeDocument, role, email, number, password, defensoria};
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
    const [existingPhone] = await connection.query('SELECT * FROM phones WHERE number = ?', [number]);
    if (existingPhone.length > 0) {
      return res.status(400).json({ message: 'El teléfono ya está registrado' });
    }
    // Insertar el nuevo usuario
    const hashedPassword = await bcrypt.hash(password,10)

    const [userResult] = await connection.query('INSERT INTO personal (name, lastname, typeDocument, document, role, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [name, lastname, typeDocument, document, role, email, hashedPassword]);
    const userId = userResult.insertId;
    
    // Insertar el teléfono
    const [phoneResult] = await connection.query('INSERT INTO phones (number) VALUES (?)', [number]);
    const phoneId = phoneResult.insertId;
    // Relacionar el usuario con el teléfono

    await connection.query('INSERT INTO phone_personal (personal, phone) VALUES (?, ?)', [userId, phoneId]);

    await connection.query('INSERT INTO defensorias_personal (defensoria,personal) VALUES (?,?)',[defensoria,userId]);
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
  }
};
exports.NewDefensoria = (req, res) => {

  console.log(req.body);
  const number = req.body.number;
  // Verificar si el número está presente
  if (!number || number == null) {
    return res.status(400).json({ error: 'Ingresar el número de la Defensoria' });
  }
  // Comenzar la consulta para verificar si ya existe una Defensoría con ese número
  db.query('SELECT * FROM defensorias WHERE defensorias.number = ?', number, (error, results) => {
    if (error) {
      console.error('Error al verificar la defensoria:', error);
      return res.status(500).json({ error: 'Error al verificar la Defensoría' });
    }
    // Si ya existe una defensoria con ese número
    if (results.length > 0) {
      return res.status(400).json({ message: 'Ya existe una Defensoría con ese número' });
    }
    // Si no existe, proceder a insertar la nueva Defensoría
    const office = `Defensoria ${number}`;
    const query = 'INSERT INTO `defensorias` (`id`, `office`, number) VALUES (NULL, ?, ?);';
    db.query(query, [office, number], (error, results) => {
      if (error) {
        console.error('Error al insertar la defensoria:', error);
        return res.status(500).json({ error: 'Error al crear la Defensoría' });
      }
      // Enviar respuesta de éxito
      return res.status(201).json({ message: 'Defensoria creada satisfactoriamente.' });
    });
  });
};
exports.DeleteDefensoria = (req,res) =>{
  console.log(req.body);
  const id = req.body.id;
  if (!id) {
    return res.status(400).json({ error: 'Ingresar el número de la Defensoria' });
  } 
  try{
    db.query('SELECT * FROM defensorias WHERE id = ?', [id], (error, results) => {
      if (error) {
          console.error('Error al verificar la defensoría:', error);
          return res.status(500).json({ error: 'Error al verificar la Defensoría' });
      }
      if (results.length === 0) {
          return res.status(400).json({ message: 'No existe una Defensoría con ese id' });
      }})
  const query = 'DELETE FROM `defensorias` WHERE `defensorias`.`id` = ?;'
  db.query(query,id,(error,results)=>{
    if (error) {
      console.error('Error al borrar la defensoria:', error);
      return res.status(500).json({ error: 'Error al borrar la Defensoría' });
    }
  console.log(results);
  return res.status(201).json({ message: 'Defensoria borrada satisfactoriamente.'});
    
  })}catch(error){
    console.error('Error al borrar la defensoria:', error);
    res.status(500).json({ message: 'Error al borrar la defensoria' });}
}
exports.DeletePersonal = async (req,res) =>{

  const { id} = req.body;
  console.log(req.body);
  const requiredFields = { id };
  const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({ message: `Faltan los siguientes campos: ${missingFields.join(', ')}` });
  }
  const connection = await db2.getConnection();
  await connection.beginTransaction();

  try {
    const [existingUser] = await connection.query('SELECT * from personal WHERE personal.id = ?', [id]);
    console.log(existingUser);
    if(existingUser.results === null){
        error
    }

    await connection.query('DELETE FROM personal WHERE personal.id = ?;',[id])
    const [deletephone] = await connection.query('SELECT phones.id FROM phones INNER JOIN phone_personal ON phones.number = phone_personal.phone WHERE phone_personal.personal = ?;',[id])
    if(deletephone.results > 0){
      await connection.query('DELETE FROM phones WHERE phones.id = ?;',[deletephone.results])
    }
    // Confirmar la transacción
    await connection.commit();
    res.status(201).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    // Revertir la transacción en caso de error
    await connection.rollback();
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
    connection.release();
  } finally {
    connection.release(); // Liberar la conexión
  }
}
exports.UpdatePersonal = async (req, res) => {
  const { id, name, lastname, typeDocument, document, role, email, number } = req.body;
  console.log('Received data:', req.body);

  const connection = await db2.getConnection();

  try {
    await connection.beginTransaction();

    // Ensure role is a number (ID)
    const roleId = parseInt(role, 10);
    if (isNaN(roleId)) {
      throw new Error('Invalid role ID');
    }

    // Verify if the role exists
    const [roleExists] = await connection.query('SELECT id FROM roles WHERE id = ?', [roleId]);
    if (roleExists.length === 0) {
      throw new Error(`Role with ID ${roleId} does not exist`);
    }

    // Update personal information
    await connection.query(
      'UPDATE personal SET name = ?, lastname = ?, typeDocument = ?, document = ?, role = ?, email = ? WHERE id = ?',
      [name, lastname, typeDocument, document, roleId, email, id]
    );

    // Update phone number
    const [existingPhone] = await connection.query(
      'SELECT phones.id FROM phones INNER JOIN phone_personal ON phones.id = phone_personal.phone WHERE phone_personal.personal = ?',
      [id]
    );

    if (existingPhone.length > 0) {
      await connection.query('UPDATE phones SET number = ? WHERE id = ?', [number, existingPhone[0].id]);
    } else {
      const [phoneResult] = await connection.query('INSERT INTO phones (number) VALUES (?)', [number]);
      const phoneId = phoneResult.insertId;
      await connection.query('INSERT INTO phone_personal (personal, phone) VALUES (?, ?)', [id, phoneId]);
    }

    await connection.commit();
    res.status(200).json({ message: 'Personal actualizado exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar el personal:', error);
    res.status(500).json({ message: error.message || 'Error al actualizar el personal' });
  } finally {
    connection.release();
  }
};