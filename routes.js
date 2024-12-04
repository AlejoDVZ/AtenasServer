const express = require('express');
const router = express.Router();
const usuarioController = require('./controllers/user')
const loginController =require('./controllers/auth')
const test = require('./controllers/test')
const admin = require('./controllers/admin')
const common = require('./controllers/commomdata')
const casesInventoryController = require('./controllers/datatable');
const error = require('./controllers/errors')

router.get("/", function (req, res) {
    console.log("funcionando")
    let respuesta = "funcionando"
    res.send(
        respuesta    
    )
  });

router.post('/login', loginController.login);
                                                      //datacomun
router.get('/common/doctype',common.documentype);
router.get('/common/education',common.educationlevel);
router.get('/common/status',common.statuscase);
router.get('/common/roles',common.roles); 
router.get('/common/defensorias',common.defensorias)
router.get('/common/fiscalias',common.fiscalias);
router.get('/common/detentioncenters',common.detentioncenters);
router.get('/common/calificaciones',common.calificaciones);

router.post('/cases-inventory', casesInventoryController.getCasesInventory);
router.post('/proceedings', casesInventoryController.getProceedings);
router.post('/case-statistics', casesInventoryController.getCaseStatistics);

router.post('/check',usuarioController.checkcase);
router.post('/cases',usuarioController.cases);
router.post('/actuaciones',usuarioController.proceedings)
router.post('/defendants', usuarioController.defendants);
router.post('/update-defendant', usuarioController.updateDefendant);
router.post('/add-defendant', usuarioController.anotherDefendant);
router.post('/update-status', usuarioController.updateStatus);
router.post('/report',usuarioController.newProceedingWithFile, usuarioController.newproceeding );
router.post('/register/newcase',usuarioController.newcase)
router.post('/download',usuarioController.downloadDOc);

                                                                //crud admin
router.get('/allmembers',admin.MemberList)                                                                

router.post('/register/member',admin.NewMember);
router.post('/register/defensoria',admin.NewDefensoria);
router.post('/register/calificacion',admin.newcalificacion);
router.post('/register/detentioncenter', admin.newDetentionCenter);

router.delete('/delete/defensoria',admin.DeleteDefensoria)
router.delete('/delete/personal',admin.DeletePersonal)
router.delete('/delete/calificacion',admin.deletecalificacion)
router.delete('/delete/detentioncenter', admin.deleteDetentionCenter);
router.put('/disable/personal',admin.DisablePersonal)

router.put('/update/password',admin.UpdatePassword)
router.put('/update/personal/:id',admin.UpdatePersonal)
                                                                  //tests
router.post('/test/login',test.login);
router.post('/test/register/:stablisment',test.insert)
router.post('/test/checkcase',test.checkcase);
router.post('/test',test.resgitertest)

// Get calendar events
router.post('/calendar-events', async (req, res) => {
  const { defensoriaId } = req.body;
  try {
    const [events] = await db.query('SELECT * FROM calendar_events WHERE defensoria_id = ?', [defensoriaId]);
    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Error al obtener los eventos del calendario' });
  }
});

// Add a new calendar event
router.post('/add-calendar-event', async (req, res) => {
  const { defensoria_id, user_id, title, start, end, allDay } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO calendar_events (defensoria_id, user_id, title, start, end, allDay) VALUES (?, ?, ?, ?, ?, ?)',
      [defensoria_id, user_id, title, start, end, allDay]
    );
    res.json({ message: 'Evento agregado exitosamente', eventId: result.insertId });
  } catch (error) {
    console.error('Error adding calendar event:', error);
    res.status(500).json({ error: 'Error al agregar el evento al calendario' });
  }
});

// Update a calendar event
router.put('/update-calendar-event/:id', async (req, res) => {
  const { id } = req.params;
  const { title, start, end, allDay } = req.body;
  try {
    await db.query(
      'UPDATE calendar_events SET title = ?, start = ?, end = ?, allDay = ? WHERE id = ?',
      [title, start, end, allDay, id]
    );
    res.json({ message: 'Evento actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Error al actualizar el evento del calendario' });
  }
});

// Delete a calendar event
router.delete('/delete-calendar-event/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM calendar_events WHERE id = ?', [id]);
    res.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Error al eliminar el evento del calendario' });
  }
});

module.exports = router;