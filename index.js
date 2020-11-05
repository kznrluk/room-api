const express = require('express');
const config = require('./codes.json');
const execSync = require('child_process').execSync;
const app = express();
const fetch = require('node-fetch');

app.use(express.json());

const irrpCommand = name => `python3 irrp.py -p -g17 -f codes.json ${name}`;

const createCO2Watcher = () => {
    let co2 = 0;
    const command = () => {
        const result = execSync('sudo python ./mh_z192.py').toString();
        
        try {
            co2 = JSON.parse(result).co2;
            console.log(co2);
        } catch (e) {
            console.error(e);
            co2 = 'ERR';
        }
    }
    setInterval(command, 60 * 1000 * 1000);
    command();
    return () => co2;
}

const createTempWatcher = () => {
    let temp = 0;
    const command = () => {
        const result = execSync('cat /sys/bus/w1/devices/28-2251cd000900/w1_slave').toString();
        temp = result.split('t=')[1] / 1000;
    };
    setInterval(command,60 * 1000 * 1000);
    command();

    return () => temp;
};

const getTemp = createTempWatcher();
const getCO2  = createCO2Watcher();


const createCO2Notifier = () => {
    const notify = (co2val) => {
        fetch('https://hooks.slack.com/services/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',
            {
                method: 'POST',
                body: JSON.stringify({
                    channel: '#co2', username: 'webhookbot', text: `部屋のCO2が高くなってます \`${co2val}ppm\``,
                    icon_emoji: ':wind_chime:'
                })
            }
        )
    }

    const toNotify = [1000, 1500, 2000, 2500, 3000, 4000, 5000];
    let notified = 0;
    setInterval(() => {
        const co2 = getCO2();
        for (let threshold of toNotify) {
            if (threshold < co2 && notified < threshold) {
                console.log('notified');
                notify(co2);
                notified = threshold;
            }
        }
	if (notified > co2) {
            notified = co2;
        }
    }, 60 * 1000);
}

createCO2Notifier();

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

app.get('/shutdown', (req, res) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify({ result: 'ok' }));
    execSync('sudo /sbin/shutdown now');
});

app.get('/co2', (req, res) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify({ result: getCO2() }));
})

app.listen(3339);
console.log('listening...');
