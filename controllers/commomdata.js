const db = require('../db')

exports.documentype = (req,res) => {
 db.query('SELECT * FROM type_documents; ',(error,results) =>{
        if (error) throw error;
        res.status(200).json(results);
});};
exports.educationlevel = (req,res) => {
    db.query('SELECT * FROM educatiolevels; ',(error,results) =>{
           if (error) throw error;
           res.status(200).json(results);
   });};
exports.statuscase = (req,res) => {
db.query('SELECT * FROM status; ',(error,results) =>{
        if (error) throw error;
        res.status(200).json(results);
});};
exports.roles = (req,res) => {
        db.query('SELECT * FROM roles; ',(error,results) =>{
                if (error) throw error;
                res.status(200).json(results);
});};
exports.defensorias = (req,res) => {
        db.query('SELECT * FROM defensorias; ',(error,results) =>{
                if (error) throw error;
                res.status(200).json(results);
});};
exports.fiscalias = (req, res) => {
        db.query('SELECT * FROM fiscalias;', (error, results) => {
          if (error) throw error;
          res.status(200).json(results);
        });
      };
exports.detentioncenters = (req, res) => {
db.query('SELECT * FROM stablisments;', (error, results) => {
        if (error) throw error;
        res.status(200).json(results);
});
};
exports.calificaciones = (req,res) => {
        db.query('SELECT * FROM calificaciones; ',(error,results) =>{
               if (error) throw error;
               res.status(200).json(results);
       });};