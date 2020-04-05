const express = require('express');
const config = require('codes.json');
const execSync = require('child_process').execSync;
const app = express();

app.use(express.json());

const irrpCommand = name => `python3 irrp.py -p -g17 -f codes.json ${name}`;

app.post('/exec', (req, res) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    const { command } = req.body;
    if (config[command]) {
        execSync(irrpCommand(command));
        req.send('{ "result": "ok" }');
    } else {
        res.send('{ "result": "no command" }');
    }
});
