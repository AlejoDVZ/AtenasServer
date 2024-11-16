const db = require('../db')

exports.documentype = (req,res) => {
 db.query('SELECT * FROM type_documents; ',(error,results) =>{
        if (error) throw error;
        res.status(200).json(results);
        console.log(results);
});};
exports.educationlevel = (req,res) => {
    db.query('SELECT * FROM educatiolevels; ',(error,results) =>{
           if (error) throw error;
           res.status(200).json(results);
           console.log(results);
   });};
exports.statuscase = (req,res) => {
db.query('SELECT * FROM status; ',(error,results) =>{
        if (error) throw error;
        res.status(200).json(results);
        console.log(results);
});};