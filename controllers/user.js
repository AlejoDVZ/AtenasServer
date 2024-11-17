const db = require('../db')


exports.cases = (req,res) =>{
  
  const id  = req.body.id;
  console.log(id);
  db.query('SELECT c.id, c.numberCausa,c.dateB,c.dateA,c.tribunalRecord,c.calification,s.status FROM user_causa_defended INNER JOIN users on users.id = user_causa_defended.user INNER JOIN causas as c on c.id = user_causa_defended.causa INNER JOIN causas_states as s on s.causa = c.id WHERE users.id = ? & s.status = 1; ' ,[id] ,(error, results) => {
    if (error) throw error;
    if (results.length === 0){
        return res.status(404).json({ message: 'Casos no encontrado' });
    }
    res.status(200).json(results);
    console.log(results);
});
}
exports.checkcase = (req,res)=>{
  const numc = req.params.numbercausa;
  console.log (req.params);
  const query = "SELECT causas.id FROM causas_states INNER JOIN causas ON causas.id = causas_states.causa WHERE causas.numberCausa = ? ";
  if (!numc) {
    return res.status(400).json({ error: 'El número de causa es obligatorio.' });
  }
  db.query(query,[numc],(error,results)=>{
    if (error) throw error;
    if (results.length === 0){
        return res.status(404)
    }
    console.log(results[0]);
    res.status(200).json(results[0]);
  })

}
exports.newcase = (req,res) =>{

  const {numberCausa,dateB,dateA,tribunalRecord,calification} = req.body;
  console.log(req.body);
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