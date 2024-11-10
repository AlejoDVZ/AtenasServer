
const db = require('../db')

exports.allusers = (req,res) =>{
  db.query('SELECT * FROM users', (error, results) => {
    if (error) throw error;
    res.status(200).json(results);
});
}

exports.person = (req,res) =>{
  const userId = req.params.id;
    db.query('SELECT * FROM users where id =?',[userId], (error, results) => {
        if (error) throw error;
        if (results.length === 0){
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(results);
    });}
