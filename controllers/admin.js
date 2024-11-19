const db = require('../db')
const mysql = require('mysql2/promise')

const db2 = mysql.createPool({
    host: "localhost",
    port:3306,
    user: "root",
    password: "",
    database: "atenasdb",
  });
exports.MemberList = (req,res) => {
  const query ='SELECT p.id, p.name, p.lastname, p.typeDocument, p.document, roles.role, emails.direction as email, phone_prefix.prefix, phones.number FROM personal AS p INNER JOIN personal_mails AS mails ON mails.personal = p.id INNER JOIN phone_personal ON phone_personal.personal = p.id INNER JOIN phones ON phone_personal.phone = phones.id INNER JOIN phone_prefix ON phones.prefix = phone_prefix.id INNER JOIN roles ON roles.id = p.role INNER JOIN emails ON emails.id = mails.mail;'
  db.query(query,(error,results) =>{
    if (error) throw error;
    res.status(200).json(results);
    console.log(results);
});
}
exports.NewMember = async (req,res) => {
  const { name, lastname, document, typeDocument, role, email,phonePrefix, phone } = req.body;
  console.log(req.body);
  const requiredFields = { name, lastname, document, typeDocument, role, email, phonePrefix, phone };
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
    const [existingEmail] = await connection.query('SELECT * FROM emails WHERE direction = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }
    // Verificar si el teléfono ya existe
    const [existingPhone] = await connection.query('SELECT * FROM phones WHERE prefix = ? & number = ?', [phonePrefix,phone]);
    if (existingPhone.length > 0) {
      return res.status(400).json({ message: 'El teléfono ya está registrado' });
    }
    // Insertar el nuevo usuario
    const [userResult] = await connection.query('INSERT INTO personal (name, lastname, typeDocument, document, role) VALUES (?, ?, ?, ?, ?)', 
      [name, lastname, typeDocument, document, role]);
    const userId = userResult.insertId;
    // Insertar el correo
    const [emailResult] = await connection.query('INSERT INTO emails (direction) VALUES (?)', [email]);
    const emailId = emailResult.insertId;
    // Insertar el teléfono
    const [phoneResult] = await connection.query('INSERT INTO phones (prefix, number) VALUES (?, ?)', [phonePrefix, phone]);
    const phoneId = phoneResult.insertId;
    // Relacionar el usuario con el correo
    await connection.query('INSERT INTO personal_mails (personal, mail) VALUES (?, ?)', [userId, emailId]);
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
  } finally {
    connection.release(); // Liberar la conexión
  }
};
