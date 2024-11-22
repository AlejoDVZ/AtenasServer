const { response } = require('express');
const mysql = require('mysql2/promise')
const db = mysql.createPool({
  host: "localhost",
  port:3306,
  user: "root",
  password: "",
  database: "atenasdb",
});

exports.cases = async (req, res) => {
  const def = req.body.def;
  if (!def) {
    return res.status(400).json({ error: 'Defensoria es obligatoria.' });
  }

  console.log('Defensoria:', def);

  const query = `
    SELECT causas.id, causas.numberCausa, causas.dateB, causas.dateA, causas.tribunalRecord, causas.fiscalia, causas.calification 
    FROM causas 
    INNER JOIN causas_states ON causas_states.causa = causas.id 
    WHERE causas_states.status = 1 AND causas.defensoria = ?
  `;

  try {
    const [results] = await db.query(query, [def]);
    console.log('Query results:', results);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Casos no encontrados' });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error in cases query:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
exports.proceedings = async (req, res) => {
  const caso = req.body.id;
  if (!caso) {
    return res.status(400).json({ error: 'Defensoria es obligatoria.' });
  }

  console.log('Caso:', caso);
  const query = `
    SELECT 
    a.id, 
    a.actividad, 
    a.resultado, 
    a.reported, 
    a.dateReport, 
    p.name, 
    p.lastname
FROM 
    actuaciones AS a
INNER JOIN 
    actuaciones_causas AS ac ON ac.causa = a.id
INNER JOIN 
    causas AS c ON c.id = ac.causa
INNER JOIN 
    personal AS p ON ac.how_report = p.id
WHERE 
    c.id = ?;
  `;

  try {
    const [results] = await db.query(query, [caso]);
    console.log('Query results:', results);

    if (results.length === 0) {
      return res.status(404).json({ message: 'procedimiento no encontrados' });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error in proceedings query:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
exports.checkcase = async (req,res)=>{
  const { numberCausa, defensoriaId } = req.body;
  
  if (!numberCausa || !defensoriaId) {
    return res.status(400).json({ error: 'Número de causa y defensoría son obligatorios.' });
  }

  try {
    const [results] = await db.query(
      'SELECT * FROM causas WHERE numberCausa = ? AND defensoria = ?',
      [numberCausa, defensoriaId]
    );

    if (results.length > 0) {
      return res.status(200).json({ exists: true, message: 'El caso ya existe para esta defensoría.' });
    } else {
      return res.status(404).json({ exists: false, message: 'El caso no existe para esta defensoría.' });
    }
  } catch (error) {
    console.error('Error al verificar el caso:', error);
    res.status(500).json({ error: 'Error al verificar el caso.' });
  }
}
exports.newcase = async (req,res) =>{
  
  console.log(req.body);
  const {numberCausa,dateB,dateA,tribunalRecord,calification, fiscalia, defendants, userId, defensoriaId} = req.body;
  
  if (!numberCausa || !dateB || !dateA || !tribunalRecord || !calification || !fiscalia || !defendants || !userId || !defensoriaId) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Insert the new case
    const [caseResult] = await connection.query(
      'INSERT INTO `causas` (`numberCausa`, `dateB`, `dateA`, `tribunalRecord`, `calification`, `fiscalia`, `defensoria`) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [numberCausa, dateB, dateA, tribunalRecord, calification, fiscalia, defensoriaId]
    );
    const caseId = caseResult.insertId;

    await connection.query(
      'INSERT INTO `causas_states` (`causa`, `status`) VALUES (?, ?)',
      [caseId, 1]
    );
    // Insert defendants and their details
    for (const defendant of defendants) {
      const [defendantResult] = await connection.query(
        'INSERT INTO `defended` (`name`, `lastname`, `typeDocument`, `document`, `birth`, `education`, `captureOrder`, `sex`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [defendant.name, defendant.lastname, defendant.typeDocument, defendant.document, defendant.birth, defendant.education, defendant.captureOrder, defendant.gender]
      );
      const defendantId = defendantResult.insertId;

      // Insert the relationship between case, defendant, and user
      await connection.query(
        'INSERT INTO `causas_defendido_usuario` (`causa`, `defendido`, `usuario`) VALUES (?, ?, ?)',
        [caseId, defendantId, userId]
      );

      // If the defendant is detained, insert into the arrested table
      if (defendant.isDetained) {
        await connection.query(
          'INSERT INTO `arrested` (`defended`, `stablisment`, `arrestedDate`) VALUES (?, ?, ?)',
          [defendantId, defendant.detentionCenter, defendant.detentionDate]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Caso y defendidos registrados exitosamente.', caseId: caseId });
  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar el caso:', error);
    res.status(500).json({ error: 'Error al registrar el caso y los defendidos.' });
  } finally {
    connection.release();
  }
};