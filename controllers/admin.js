const db = require('../db')

exports.NewMember = (req,res) =>{
    const member = req.body
    console.log(member);
    const {name,lname,td,document,role} = req.body;
  
    if (!name || !lname || !td || !document || !role){
      console.log("falta algo")
      return res.status(400).json({error:"falta algo mi loco"})
    }
  
    db.query('INSERT INTO `personal` (`id`, `name`, `lastname`, `typeDocument`, `document`, `role`) VALUES (NULL, ?,?,?,?,?);',
    [name,lname,td,document,role],(err,results)=>{
        if(err){
          console.error('Error al insertar el nuevo miembro:', err.message);
          return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ id: res.insertId, name, lastname: lname, typeDocument: td, document, role });
    })
  }
