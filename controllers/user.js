const db = require('../db')


exports.test = (req,res) =>{
  console.log(req.body); // Asegúrate de que aquí se vean los datos
  res.send(req.body);
}
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
  const numc = req.params.numbercausa
  db.query('SELECT causas.id FROM causas_states INNER JOIN causas ON causas.id = causas_states.causa WHERE causas.numberCausa = ?',[numc],(error,results)=>{
    if (error) throw error;
    if (results.length === 0){
        return res.status(404)
    }
    res.status(200).json(results);
    console.log(results);
  })
}
exports.activatecase =(req,res) =>{
  const idcase = req.params.id;
  const status = req.parasms.status
  db.query('UPDATE UPDATE `causas_states` SET `status` = 1 WHERE causas_states.id = ? ')
}
exports.newcase = (req,res) =>{
  const numbrecase = req.params

}