const { response } = require('express');
const db = require('../db')


exports.cases = (req,res) =>{
  
  const id  = req.body.id;
  console.log(id);
  db.query('SELECT DISTINCT c.id, c.numberCausa,c.dateB,c.dateA,c.tribunalRecord,c.calification,s.status FROM user_causa_defended INNER JOIN users on users.id = user_causa_defended.user INNER JOIN causas as c on c.id = user_causa_defended.causa INNER JOIN causas_states as s on s.causa = c.id WHERE users.id = ? & s.status = 1; ' ,[id] ,(error, results) => {
    if (error) throw error;
    if (results.length === 0){
        return res.status(404).json({ message: 'Casos no encontrado' });
    }
    res.status(200).json(results);
    console.log(results[0]);
});
}
exports.checkcase = (req,res)=>{
  const numberCausa = req.body.numberCausa;
  console.log(numberCausa);
  if (!numberCausa) {
    return res.status(400).json({ error: 'El número de causa es obligatorio.' });
  }
  db.query('SELECT * FROM causas WHERE numberCausa = ?;',[numberCausa],(error,results) =>{
    if (error) throw error;
    if (results.length === 0){
        return res.status(404).json({ message: 'Casos no encontrado' });
    }
    res.status(200).json({"menjsaje":"erespelotudo"});
    console.log(results[0]);
  })
}
exports.newcase = (req,res) =>{
  
  console.log(req.body);
  const {numberCausa,dateB,dateA,tribunalRecord,calification} = req.body;
  
  if (!numberCausa || !dateB || !dateA || !tribunalRecord || !calification) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  db.query('INSERT INTO `causas` (`id`, `numberCausa`, `dateB`, `dateA`, `tribunalRecord`, `calification`) VALUES (NULL, ?, ?, ?, ?, ?);',[numberCausa,dateB,dateA,tribunalRecord,calification],(error,results)=>{
    if (error) {
      console.error('Error al insertar el caso:', error);
      return res.status(500).json({ error: 'Error al crear el caso.' });
    }
    console.log(results);
    return res.status(201).json({ message: 'Caso creado exitosamente.', id: results.insertId });
    
  })
}
exports.newdefendant = (req, res) => {

  const defendants = req.body.defendants;

  if (!Array.isArray(defendants) || defendants.length === 0) {
    return res.status(400).json({ error: 'Se espera un array de defendidos.' });
  }

  const caseId = req.body.caseId;
  const user = req.body.user
  const defendido = defendants[0]; // Tomamos el primer defendido del array
  console.log(defendido,user,caseId);


  const query1 = 'INSERT INTO `defended` (`id`, `name`, `lastname`, `typeDocument`, `document`, `birth`, `education`, `captureOrder`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?);';
  const query2 = 'INSERT INTO `user_causa_defended` (`id`, `user`, `defended`, `causa`) VALUES (NULL, ?, ?, ?);';


  if (!defendido.name || !defendido.lastname || !defendido.typeDocument || !defendido.document || !defendido.birth || !defendido.education || defendido.captureOrder === undefined || !user || !caseId) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  // Iniciar una transacción
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error al iniciar la transacción:', err);
      return res.status(500).json({ error: 'Error al iniciar la transacción.' });
    }
    // Primer insert
    db.query(
      query1,
      [defendido.name, defendido.lastname, defendido.typeDocument, defendido.document, defendido.birth, defendido.education, defendido.captureOrder],
      (error, results) => {
        if (error) {
          return db.rollback(() => {
            console.error('Error al registrar el defendido:', error);
            return res.status(500).json({ error: 'Error al crear el defendido.' });
          });
        }
        const idcreada = results.insertId; // Obtener el ID del defendido creado
        // Segundo insert
        db.query(
          query2,
          [user, idcreada, caseId],
          (error, results) => {
            if (error) {
              return db.rollback(() => {
                console.error('Error al registrar la relación:', error);
                return res.status(500).json({ error: 'Error al crear la relación.' });
              });
             
    
            }
            // Si ambos inserts son exitosos, confirmar la transacción
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error al confirmar la transacción:', err);
                  return res.status(500).json({ error: 'Error al confirmar la transacción.' });
                });
              }
              // Responder al cliente
              return res.status(201).json({ message: 'Defendido registrado exitosamente.', idDefendido: idcreada});
            });
          }
        );
      }
    );
  });
};