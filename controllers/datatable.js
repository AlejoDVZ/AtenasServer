const mysql = require('mysql2/promise');
const db = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "atenasdb",
});

exports.getCasesInventory = async (req, res) => {
  const { def } = req.body;
  if (!def) {
    return res.status(400).json({ error: 'Defensoria es obligatoria.' });
  }

  try {
    const query = `
      SELECT 
        c.id, 
        c.numberCausa, 
        c.dateB, 
        c.dateA, 
        c.tribunalRecord, 
        c.fiscalia, 
        c.calification, 
        s.state
      FROM causas c
      INNER JOIN causas_states cs ON cs.causa = c.id
      INNER JOIN status s ON cs.status = s.id
      WHERE c.defensoria = ?
    `;

    const [cases] = await db.query(query, [def]);

    // Fetch defendants for each case
    for (let caseItem of cases) {
      const defendantsQuery = `
        SELECT 
          d.id, 
          d.name, 
          d.lastname, 
          d.typeDocument, 
          d.document, 
          d.sex, 
          d.birth, 
          d.education, 
          d.captureOrder,
          a.stablisment, 
          a.provisional, 
          a.arrestedDate, 
          a.freed
        FROM causas_defendido_usuario cdu
        INNER JOIN defended d ON cdu.defendido = d.id
        LEFT JOIN arrested a ON a.defended = d.id
        WHERE cdu.causa = ?
      `;
      const [defendants] = await db.query(defendantsQuery, [caseItem.id]);
      caseItem.defendants = defendants;
    }

    res.status(200).json(cases);
  } catch (error) {
    console.error('Error in getCasesInventory:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getProceedings = async (req, res) => {
  const { caseId } = req.body;
  console.log(req.body);
  if (!caseId) {
    return res.status(400).json({ error: 'ID del caso es obligatorio.' });
  }

  try {
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
      FROM actuaciones AS a
      INNER JOIN actuaciones_causas AS ac ON ac.actuacion = a.id
      INNER JOIN personal AS p ON ac.how_report = p.id
      WHERE ac.causa = ?
    `;

    const [proceedings] = await db.query(query, [caseId]);
    console.log([proceedings]);
    res.status(200).json(proceedings);
  } catch (error) {
    console.error('Error in getProceedings:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getCaseStatistics = async (req, res) => {
  const { def } = req.body;
  if (!def) {
    return res.status(400).json({ error: 'Defensoria es obligatoria.' });
  }

  try {
    const statusQuery = `
      SELECT s.state, COUNT(*) as count
      FROM causas c
      INNER JOIN causas_states cs ON cs.causa = c.id
      INNER JOIN status s ON cs.status = s.id
      WHERE c.defensoria = ?
      GROUP BY s.state
    `;

    const libertyQuery = `
      SELECT 
        CASE 
          WHEN a.stablisment IS NOT NULL THEN 'Detenido'
          WHEN d.captureOrder = 1 THEN 'Orden de captura'
          ELSE 'Libre'
        END AS liberty_status,
        COUNT(*) as count
      FROM causas c
      INNER JOIN causas_defendido_usuario cdu ON cdu.causa = c.id
      INNER JOIN defended d ON cdu.defendido = d.id
      LEFT JOIN arrested a ON a.defended = d.id
      WHERE c.defensoria = ?
      GROUP BY liberty_status
    `;

    const [statusStats] = await db.query(statusQuery, [def]);
    const [libertyStats] = await db.query(libertyQuery, [def]);
    console.log(statusStats,libertyStats);
    res.status(200).json({
      statusStats,
      libertyStats
    });
  } catch (error) {
    console.error('Error in getCaseStatistics:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};