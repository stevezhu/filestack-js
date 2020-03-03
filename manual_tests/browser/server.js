const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const util = require('util');

const intTwoChars = (i) => (`0${i}`).slice(-2)

const getCurrentTime = () => {
  let date_ob = new Date();
  // let date = this.IntTwoChars(date_ob.getDate());
  // let month = this.IntTwoChars(date_ob.getMonth() + 1);
  // let year = date_ob.getFullYear();
  let hours = intTwoChars(date_ob.getHours());
  let minutes = intTwoChars(date_ob.getMinutes());
  let seconds = intTwoChars(date_ob.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

app.use(express.static('.'));
app.use(express.static('./../../build/browser-dev/'))

const jsonParser = bodyParser.json();
app.post('/console', jsonParser, (req, res) => {
  const body = req.body;

  const preamble = [`\x1b[36m[${getCurrentTime()}]\x1b[0m`];

  switch(body.type) {
    case 'log':
      preamble.push("\x1b[34m[LOG]:\x1b[0m");
      break;
    case 'warn':
      preamble.push("\x1b[33m[WARN]:\x1b[0m");
      break;
    case 'error':
      preamble.push("\x1b[31m[ERROR]:\x1b[0m");
      break;
    default:
      preamble.push(`\x1b[37m[${body.type}]: \x1b[0m`);
      body.type = 'log';
      break;
  }

  const toPrint = body.data.map((el) =>{
    if (el && typeof el === 'string') {
      return el.replace(/%c/g, '').replace(/^color: (#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}|inherit)$/, '');
    }

    return el;
  }).filter((s) => {
    if (typeof s === 'string') {
      return s.length > 0;
    }

    return true;
  });

  process.stderr.write(`${preamble.join(' ')} ${util.format(...toPrint)}\n`);
  res.sendStatus(200);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

