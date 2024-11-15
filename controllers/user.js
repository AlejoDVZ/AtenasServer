const db = require('../db')


exports.test = (req,res) =>{
  console.log(req.body); // Asegúrate de que aquí se vean los datos
  res.send(req.body);
}
exports.cases = (req,res) =>{
  db.query('SELECT * FROM causas', (error, results) => {
    if (error) throw error;
    if (results.length === 0){
        return res.status(404).json({ message: 'Casos no encontrado' });
    }
    res.status(200).json(results);
    console.log(results);
});
}