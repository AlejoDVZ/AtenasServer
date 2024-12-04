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
  const query ='SELECT p.id, p.name, p.lastname, p.typeDocument, p.document, roles.role as role, p.email, phones.number, dp.defensoria FROM personal AS p INNER JOIN phone_personal ON phone_personal.personal = p.id INNER JOIN phones ON phone_personal.phone = phones.id INNER JOIN roles ON roles.id = p.role LEFT JOIN defensorias_personal as dp on p.id = dp.personal WHERE inactive = 0;'
  db.query(query,(error,results) =>{
    if (error) throw error;
    res.status(200).json(results);
});
}
exports.NewMember = async (req, res) => {
  const { name, lastname, document, typeDocument, role, email, number, password, defensoria } = req.body;
  console.log(req.body);
  
  const def = parseInt(defensoria, 10);
  const requiredFields = { name, lastname, document, typeDocument, role, email, number, password, defensoria };
  const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Faltan los siguientes campos: ${missingFields.join(', ')}`);
  }

  const connection = await db2.getConnection();

  try {
    await connection.beginTransaction(); // Iniciar una transacción

    if (parseInt(role, 10) === 1) {
      const [existingTitular] = await connection.query(
        `SELECT *
         FROM personal p 
         JOIN defensorias_personal dp ON p.id = dp.personal 
         WHERE dp.defensoria = ? AND p.role = 1`, [def]
      );
      if (existingTitular.length > 0) {
        console.log('Ya existe titular');
        throw new Error('El titular ya existe');
      }

      // Verificar si el rol existe
      const [roleExists] = await connection.query('SELECT id FROM roles WHERE id = ?', [role]);
      if (roleExists.length === 0) {
        throw new Error(`Role with ID ${role} does not exist`);
      }
    }

    // Verificar si el usuario ya existe
    const [existingUser ] = await connection.query('SELECT * FROM personal WHERE document = ?', [document]);
    if (existingUser .length > 0) {
      if (existingUser[0].inactive === 1) {
        await connection.query('UPDATE personal SET inactive = 0 WHERE id = ?', [existingUser[0].id]);
        console.log('Usuario reactivado');
        return res.status(200).json({ message: 'Usuario reactivado exitosamente' });
      } else {
        console.log('Usuario ya existe y está activo');
        throw new Error('El usuario ya existe y está activo');
      }
    }

    // Verificar si el correo ya existe
    const [existingEmail] = await connection.query('SELECT * FROM personal WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      console.log('Correo registrado');
      throw new Error('El correo ya está registrado');
    }

    // Verificar si el teléfono ya existe
    const [existingPhone] = await connection.query('SELECT * FROM phones WHERE number = ?', [number]);
    if (existingPhone.length > 0) {
      console.log('Teléfono registrado');
      throw new Error('El teléfono ya está registrado');
    }

    // Insertar el nuevo usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await connection.query(
      'INSERT INTO personal (name, lastname, typeDocument, document, role, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [name, lastname, typeDocument, document, role, email, hashedPassword]
    );
    const userId = userResult.insertId;

    // Insertar el teléfono
    const [phoneResult] = await connection.query('INSERT INTO phones (number) VALUES (?)', [number]);
    const phoneId = phoneResult.insertId;

    // Relacionar el usuario con el teléfono
    await connection.query('INSERT INTO phone_personal (personal, phone) VALUES (?, ?)', [userId, phoneId]);
    await connection.query('INSERT INTO defensorias_personal (defensoria, personal) VALUES (?, ?)', [defensoria, userId]);

    // Confirmar la transacción
    await connection.commit();
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    // Revertir la transacción en caso de error
    await connection.rollback();
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: error.message || 'Error al crear el usuario' });
  } finally {
    connection.release(); // Asegúrate de liberar la conexión
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
exports.NewFiscalia = (req, res) => {

  console.log(req.body);
  const number = req.body.number;
  // Verificar si el número está presente
  if (!number || number == null) {
    return res.status(400).json({ error: 'Ingresar el número de la Fiscalia' });
  }
  // Comenzar la consulta para verificar si ya existe una Defensoría con ese número
  db.query('SELECT * FROM fiscalias WHERE fiscalias.number = ?', number, (error, results) => {
    if (error) {
      console.error('Error al verificar la Fiscalia:', error);
      return res.status(500).json({ error: 'Error al verificar la Fiscalia' });
    }
    // Si ya existe una defensoria con ese número
    if (results.length > 0) {
      return res.status(400).json({ message: 'Ya existe una Fiscalia con ese número' });
    }
    // Si no existe, proceder a insertar la nueva Defensoría
    const office = `Fiscalia ${number}`;
    const query = 'INSERT INTO `defensorias` (`id`, `office`, number) VALUES (NULL, ?, ?);';
    db.query(query, [office, number], (error, results) => {
      if (error) {
        console.error('Error al insertar la fiscalia:', error);
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
exports.DisablePersonal = async (req,res) =>{

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
    const fuap = await connection.query('UPDATE `personal` SET `inactive` = 1 WHERE `personal`.`id` = ?',[id]);
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
  const { id, name, lastname, typeDocument, document, role, email, number,defensoria } = req.body;
  console.log('Received data:', req.body);
  const def = parseInt(defensoria,10);
  console.log('defensoria parseada',def)
  const connection = await db2.getConnection();

  try {
    await connection.beginTransaction();

    // Ensure role is a number (ID)
    const roleId = parseInt(role, 10);
    if (isNaN(roleId)) {
      throw new Error('Invalid role ID');
    }
    if(role === 1){
      const [existingTitular] = await connection.query(
        `SELECT *
         FROM personal p 
         JOIN defensorias_personal dp ON p.id = dp.personal 
         WHERE dp.defensoria = ? AND p.role = 1`,[def, id]
      );
      if (existingTitular.length > 0) {
        throw new Error('El titular ya existe');
      }
      console.log('debug')
      // Verify if the role exists
      const [roleExists] = await connection.query('SELECT id FROM roles WHERE id = ?', [roleId]);
      if (roleExists.length === 0) {
        throw new Error(`Role with ID ${roleId} does not exist`);
      }
    }
    
    // Update personal information
    await connection.query(
      'UPDATE personal SET name = ?, lastname = ?, typeDocument = ?, document = ?, role = ?, email = ? WHERE id = ?',
      [name, lastname, typeDocument, document, roleId, email, id]
    );

    //update defensoria
    await connection.query(
      'UPDATE defensorias_personal SET defensoria = ? WHERE defensorias_personal.id = ?; ',
      [def,id]
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
exports.UpdatePassword = async (req, res) => {
  const { id, password } = req.body;

  // Validar campos requeridos
  if (!id || !password) {
    return res.status(400).json({ message: 'ID y nueva contraseña son requeridos.' });
  }

  // Validar la longitud de la nueva contraseña
  if (password.length < 8) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
  }
  console.log(password,id)
  const connection = await db2.getConnection();

  try {
    await connection.beginTransaction();

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña en la base de datos
    const [result] = await connection.query('UPDATE personal SET password = ? WHERE id = ?', [hashedPassword, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró el personal con ese ID.' });
    }

    // Confirmar la transacción
    await connection.commit();
    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    // Revertir la transacción en caso de error
    await connection.rollback();
    console.error('Error al actualizar la contraseña:', error);
    res.status(500).json({ message: 'Error al actualizar la contraseña.' });
  } finally {
    connection.release();
  }
};

exports.newcalificacion = async (req,res) =>{
  const  calificacion  = req.body.calificacion;

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  const Tcalificacion = toTitleCase(calificacion)

  const connection = await db2.getConnection();
  try {
    await connection.beginTransaction();

    const [existingCalification] = await connection.query(
      'SELECT * FROM `calificaciones` WHERE `calificacion` = ?;',
      [Tcalificacion]
    );

    if (existingCalification.length > 0) {
      return res.status(400).json({ error: 'La calificación ya existe en la base de datos' });
    }


    const [calificationResult] = await connection.query(
      'INSERT INTO `calificaciones` (`calificacion`) VALUES (?);',
      [Tcalificacion]
    );

    await connection.commit();
    return res.status(201).json({ message: 'calificacion registrada exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar la calificacion:', error);
    res.status(500).json({ error: 'Error al registrar la calificacion' });
  } finally {
    connection.release();
  }
};

exports.deletecalificacion = async (req,res) =>{

  console.log('requestbody',req.body)
  const  id  = req.body.id;
  console.log('Id:',id)

  const connection = await db2.getConnection();
  try {
    await connection.beginTransaction();

    const [existingCalification] = await connection.query(
      'SELECT * FROM `calificaciones` WHERE `id` = ?;',
      [id]
    );

    if (existingCalification.length === 0) {
      return res.status(404).json({ error: 'Calificación no encontrada' });
    }


    // Borrar la calificación por ID
    await connection.query(
      'DELETE FROM `calificaciones` WHERE `id` = ?;',
      [id]
    );

    await connection.commit();
    return res.status(201).json({ message: 'calificacion eliminada exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar la calificacion:', error);
    res.status(500).json({ error: 'Error al eliminar la calificacion' });
  } finally {
    connection.release();
  }
};

exports.newDetentionCenter = async (req, res) => {
  const { name } = req.body;

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  const centerName = toTitleCase(name);

  const connection = await db2.getConnection();
  try {
    await connection.beginTransaction();

    const [existingCenter] = await connection.query(
      'SELECT * FROM `stablisments` WHERE `name` = ?;',
      [centerName]
    );

    if (existingCenter.length > 0) {
      return res.status(400).json({ error: 'El centro de reclusión ya existe en la base de datos' });
    }

    const [centerResult] = await connection.query(
      'INSERT INTO `stablisments` (`name`) VALUES (?);',
      [centerName]
    );

    await connection.commit();
    return res.status(201).json({ message: 'Centro de reclusión registrado exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar el centro de reclusión:', error);
    res.status(500).json({ error: 'Error al registrar el centro de reclusión' });
  } finally {
    connection.release();
  }
};

exports.updateDetentionCenter = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  const centerName = toTitleCase(name);

  const connection = await db2.getConnection();
  try {
    await connection.beginTransaction();

    const [existingCenter] = await connection.query(
      'SELECT * FROM `detention_centers` WHERE `name` = ? AND `id` != ?;',
      [centerName, id]
    );

    if (existingCenter.length > 0) {
      return res.status(400).json({ error: 'Ya existe un centro de reclusión con ese nombre' });
    }

    await connection.query(
      'UPDATE `detention_centers` SET `name` = ? WHERE `id` = ?;',
      [centerName, id]
    );

    await connection.commit();
    return res.status(200).json({ message: 'Centro de reclusión actualizado exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar el centro de reclusión:', error);
    res.status(500).json({ error: 'Error al actualizar el centro de reclusión' });
  } finally {
    connection.release();
  }
};

exports.deleteDetentionCenter = async (req, res) => {
  const { id } = req.body;
  const connection = await db2.getConnection();
  try {
    await connection.beginTransaction();

    const [existingCenter] = await connection.query(
      'SELECT * FROM `stablisments` WHERE `id` = ?;',
      [id]
    );

    if (existingCenter.length === 0) {
      return res.status(404).json({ error: 'Centro de reclusión no encontrado' });
    }

    await connection.query(
      'DELETE FROM `stablisments` WHERE `id` = ?;',
      [id]
    );

    await connection.commit();
    return res.status(200).json({ message: 'Centro de reclusión eliminado exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar el centro de reclusión:', error);
    res.status(500).json({ error: 'Error al eliminar el centro de reclusión' });
  } finally {
    connection.release();
  }
};
