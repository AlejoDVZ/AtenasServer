const { response } = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const db = mysql.createPool({
  host: "localhost",
  port:3306,
  user: "root",
  password: "",
  database: "atenasdb",
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { defensoriaId, caseId } = req.body;
    const dir = path.join(__dirname, '..', 'uploads', defensoriaId.toString(), caseId.toString());
    fs.ensureDirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

exports.newProceedingWithFile = upload.single('file');

exports.cases = async (req, res) => {
  const def = req.body.def;
  if (!def) {
    return res.status(400).json({ error: 'Defensoria es obligatoria.' });
  }

  console.log('Defensoria:', def);

  const query = `
    SELECT causas.id, causas.numberCausa, causas.dateB, causas.dateA, causas.tribunalRecord, causas.fiscalia, causas.calification,status.id as status
    FROM causas 
    INNER JOIN causas_states ON causas_states.causa = causas.id 
    INNER JOIN status ON causas_states.status = status.id 
    WHERE causas_states.status IN (1,3

    ) AND causas.defensoria = ?
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
  console.log('debug de la funcion',req.body.id);
  if (!caso) {
    return res.status(400).json({ error: 'caso es obligatorio.' });
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
    p.lastname,
    a.attachmentPath
FROM 
    actuaciones AS a
INNER JOIN 
    actuaciones_causas AS ac ON ac.actuacion = a.id
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
exports.addDefendant = async (req, res) => {
  const {
    // Defendant basic info
    name,
    lastname,
    typeDocument,
    document,
    sex,
    birth,
    education,
    captureOrder,
    // Case and user info
    caseId,
    userId,
    // Detention info (optional)
    isDetained,
    stablisment,
    provisional,
    arrestedDate
  } = req.body;

  // Validate required fields
  if (!name || !lastname || !typeDocument || !document || !caseId || !userId) {
    return res.status(400).json({ error: 'Campos obligatorios faltantes.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Insert the new defendant
    const [defendantResult] = await connection.query(
      'INSERT INTO defended (name, lastname, typeDocument, document, sex, birth, education, captureOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, lastname, typeDocument, document, sex, birth, education, captureOrder]
    );
    const defendantId = defendantResult.insertId;

    // Create relationship between case, defendant and user
    await connection.query(
      'INSERT INTO causas_defendido_usuario (causa, defendido, usuario) VALUES (?, ?, ?)',
      [caseId, defendantId, userId]
    );

    // If the defendant is detained, add detention record
    if (isDetained) {
      await connection.query(
        'INSERT INTO arrested (defended, stablisment, provisional, arrestedDate, freed) VALUES (?, ?, ?, ?, false)',
        [defendantId, stablisment, provisional, arrestedDate]
      );
    }

    await connection.commit();
    res.status(201).json({ 
      message: 'Defendido agregado exitosamente al caso.',
      defendantId: defendantId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al agregar defendido:', error);
    res.status(500).json({ error: 'Error al agregar el defendido al caso.' });
  } finally {
    connection.release();
  }
};

exports.downloadDOc = async (req, res) => {
  const caso  = req.body.attachmentPath;
  console.log(caso)

  try {
    const [result] = await db.query('SELECT attachmentPath FROM actuaciones WHERE attachmentPath = ?', [caso]);
    
    if (result.length === 0 || !result[0].attachmentPath) {
      return res.status(404).send('File not found');
    }

    const filePath = path.join(result[0].attachmentPath);
    res.download(filePath);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).send('Error downloading file');
  }
};
exports.defendants = async (req, res) => {
  const caso  = req.body.caso;
  console.log(caso);
  if (!caso) {
    return res.status(400).json({ error: 'Falta la información del caso.' });
  }

  const connection = await db.getConnection();
  try {
    const [defendants] = await connection.query(
      `SELECT DISTINCT d.id, d.name, d.lastname, d.typeDocument, d.document, d.sex, d.birth, d.education, d.captureOrder,
              a.stablisment, a.provisional, a.arrestedDate, a.freed
       FROM causas_defendido_usuario AS cdu
       INNER JOIN defended AS d ON cdu.defendido = d.id
       LEFT JOIN arrested AS a ON a.defended = d.id
       WHERE cdu.causa = ?`,
      [caso]
    );
    if (defendants.length < 1) {
      res.status(404).json({message : "no hay nada"})
    }
    res.status(200).json(defendants);
  } catch (error) {
    console.error('Error al obtener los defendidos:', error);
    res.status(500).json({ error: 'Error al obtener los defendidos.' });
  } finally {
    connection.release();
  }
};
exports.updateDefendant = async (req, res) => {
  const { defendantId, ...updates } = req.body;

  if (!defendantId) {
    return res.status(400).json({ error: 'Falta el ID del defendido.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    if (updates.freed) {
      await connection.query(
        'UPDATE arrested SET freed = TRUE WHERE defended = ?',
        [defendantId]
      );
    } else if (updates.arrested) {
      await connection.query(
        'INSERT INTO arrested (defended, stablisment, arrestedDate) VALUES (?, ?, ?)',
        [defendantId, updates.stablisment, updates.arrestedDate]
      );
      await connection.query(
        'UPDATE defended SET captureOrder = FALSE WHERE id = ?',
        [defendantId]
      );
    } else if (updates.captureOrder !== undefined) {
      await connection.query(
        'UPDATE defended SET captureOrder = ? WHERE id = ?',
        [updates.captureOrder, defendantId]
      );
    }

    await connection.commit();
    res.status(200).json({ message: 'Defendido actualizado exitosamente.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar el defendido:', error);
    res.status(500).json({ error: 'Error al actualizar el defendido.' });
  } finally {
    connection.release();
  }
};
exports.updateStatus = async (req, res) => {
  const {status,caso} = req.body;
  const estado = parseInt(status)
  console.log(req.body);

  if (!status || !caso) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

      await connection.query(
        'UPDATE causas_states SET status = ? WHERE causa = ?',
        [status,caso])

    await connection.commit();
    res.status(200).json({ message: 'Status actualizado exitosamente.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar status de causa:', error);
    res.status(500).json({ error: 'Error al actualizar la causa.' });
  } finally {
    connection.release();
  }
};
exports.newproceeding = async (req,res) =>{
  const { activity, reportDate, result, caseId, userId } = req.body;
  let filePath = null;

  console.log(req.body)

  if (req.file) {
    console.log('Nombre del archivo:', req.file.filename);
    console.log('Ruta del archivo:', req.file.path);
    console.log('Tipo de archivo:', req.file.mimetype);
    filePath = req.file.path.replace(__dirname + '/../', '');
  }
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Insertar la actuación
    const [proceedingResult] = await connection.query(
      'INSERT INTO actuaciones (actividad, resultado, reported, dateReport) VALUES (?, ?, NOW(), ?)',
      [activity, result, reportDate]
    );
    const proceedingId = proceedingResult.insertId;

    // Insertar en la tabla relacional
    await connection.query(
      'INSERT INTO actuaciones_causas (causa, actuacion, how_report) VALUES (?, ?, ?)',
      [caseId, proceedingId, userId]
    );

    // Si hay un archivo, guardar su ruta en la base de datos
    if (filePath) {
      await connection.query(
        'UPDATE actuaciones SET attachmentPath = ? WHERE id = ?',
        [filePath, proceedingId]
      );
    }

    await connection.commit();
    return res.status(201).json({ message: 'Actuación registrada exitosamente', proceedingId });
  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar la actuación:', error);
    res.status(500).json({ error: 'Error al registrar la actuación' });
  } finally {
    connection.release();
  }
} 

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