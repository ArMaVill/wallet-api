const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const routes = require('./api/route/routes');
require('dotenv').config();

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
const port = process.env.PORT || 3000;

const db = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}`;
mongoose.connect(db, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useFindAndModify', false);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use('/', routes);

app.get('*', (req, res) => {
  res.status(404).send({ error: true, message: 'URL NO ENCONTRADA' });
});

app.listen(port, () => {
  console.log('El servidor está inicializado en el puerto 3000');
});

const respuesta = {};
app.get('/', (req, res) => {
  res.send('DB connection stablished');
});
