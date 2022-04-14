import express from 'express';
import session from 'express-session';
import path from 'path';
import mysql from 'mysql2/promise';
import bodyParser from 'body-parser';
import moment from 'moment';

const __dirname = path.resolve();
const app = express();
app.use(express.static(__dirname + '/static'));
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'templates'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const config = {
    host: 'maxonbtc.beget.tech',
    user: 'maxonbtc_test',
    password: 'cagnN%9n',
    database: 'maxonbtc_test'
}

app.use(session({
    secret: 'afsafewqfdwf',
    resave: true,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/table', async function (req, res) {
    res.render('route', { table: await getNote() });
});

app.post('/table', async function (req, res) {
    const timeStart = Date.now();
    const prime = await deapazonCheck(req.body.startD, req.body.endD);
    const processTime = String(await msToTime(Date.now() - timeStart)) + ' or ' + String(Date.now() - timeStart) + ' ms';

    await makeNote(moment().subtract(10, 'days').calendar(), 'JS Express', req.body.startD, req.body.endD, prime, processTime);

    res.render('route', { table: await getNote() });
});

app.get('/clean', async function (req, res) {
    await cleanData();
    res.redirect('/table');
});

app.listen(3000);

async function getNote() {
    const conn = await mysql.createConnection(config);
    const [rows, fields] = await conn.execute('select * from bakalavratest');
    conn.end;
    return rows;
}

async function makeNote(data, stack, start, end, num, time) {
    const conn = await mysql.createConnection(config);
    try {
        await conn.execute(`INSERT INTO \`bakalavratest\`(\`data\`, \`stack\`, \`start\`, \`end\`, \`num\`, \`time\`) VALUES ('${data}','${stack}','${start}','${end}','${num}','${time}')`);
    } catch (error) {
        conn.end;
        return false;
    }
    conn.end;
    return true;
}

async function cleanData() {
    const conn = await mysql.createConnection(config);
    try {
        await conn.execute(`DELETE FROM \`bakalavratest\``);
    } catch (error) {
        conn.end;
        return false;
    }
    conn.end;
    return true;
}

async function isPrime(num) {
    for (let i = 2; i < num; i++) {
        if (num % i === 0) {
            return false;
        }
    }
    return num > 1;
}

async function deapazonCheck(startNum, endNum) {
    let primeNumCol = 0;
    for (let i = startNum; i <= endNum; i++) {
        if (await isPrime(i)) primeNumCol++;
    }
    return primeNumCol;
}

async function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}
