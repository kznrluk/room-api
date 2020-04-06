const express = require('express');
const config = require('./codes.json');
const execSync = require('child_process').execSync;
const app = express();

app.use(express.json());

const irrpCommand = name => `python3 irrp.py -p -g17 -f codes.json ${name}`;

const createTempWatcher = () => {
    let temp = 0;
    const command = () => {
        const result = execSync('cat /sys/bus/w1/devices/28-2251cd000900/w1_slave').toString();
        temp = result.split('t=')[1] / 1000 + 2.7;
    };
    setInterval(command,60 * 1000 * 1000);
    command();

    return () => temp;
};

const getTemp = createTempWatcher();

app.post('/exec', (req, res) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    const { command } = req.body;
    if (config[command]) {
        execSync(irrpCommand(command));
        res.send('{ "result": "ok" }');
    } else {
        res.send('{ "result": "no command" }');
    }
});

app.get('/exec', (req, res) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    const { command } = req.query;
    if (config[command]) {
        execSync(irrpCommand(command));
        res.send('{ "result": "ok" }');
    } else {
        res.send('{ "result": "no command" }');
    }
});

app.get('/temp', (req, res) => {
    const temp = getTemp();
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify({ temp }))
});

app.listen(3339);
console.log('listening...');
