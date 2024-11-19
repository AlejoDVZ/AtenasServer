const mysql = require('mysql2')
const promise = require('mysql2/promise')

const db = mysql.createConnection({
    host: "localhost",
    port:3306,
    user: "root",
    password: "",
    database: "atenasdb",
  });


  db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL!');
});
  module.exports = db;