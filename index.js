const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const CorsOptions ={
    origin: "http://localhost:5173",
    optionSucessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']

}

const router = require("./routes")


app.use(express.urlencoded({extended: true}));
app.use(cors(CorsOptions));
app.use(bodyParser.json());
app.use(router)

app.listen(process.env.PORT||3300,() => {
    console.log("Servidor corriendo en el puerto 3300");
});


module.exports = app;