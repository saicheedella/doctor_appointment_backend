const cors = require('cors');
const logger = require('morgan');
const express = require('express');
const app = express();
const nodeCron = require("node-cron");
const { appointmentsRemainderService } = require('./serviceWorkers');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.options('*', cors());

app.get('/', (req, res) => {
  res.send({ message: 'No cookie for you' });
});

nodeCron.schedule('1 1 * * * *', () => {
  appointmentsRemainderService();
});

const port = process.env.PORT || 8000;

app.use('/api/', require('./routes/index'));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
