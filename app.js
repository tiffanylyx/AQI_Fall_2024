const express = require('express');
const path = require('path');
const fs = require('fs');


const app = express();

const API_KEY = 'BB66CD77-8E6B-465B-9AC0-AD602FBC8827';
const BBOX = '-84.3,33.690,-84.2,33.691';
const PARAMETERS = 'OZONE,PM25,PM10,CO,NO2,SO2';
const URL_BASE = 'https://www.airnowapi.org/aq/data/?parameters=' + PARAMETERS + '&BBOX=' + BBOX + '&dataType=B&format=application/json&verbose=1&monitorType=0&includerawconcentrations=1&API_KEY=' + API_KEY;
const JSON_FILE = 'air_quality_data.json';
const logFilePath = './logs/browser.log';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());  // Middleware to parse JSON bodies

// Ensure the logs directory exists
if (!fs.existsSync(path.dirname(logFilePath))) {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

app.post('/log', (req, res) => {
    const { message, optionalParams } = req.body;
    const logEntry = `${new Date().toISOString()} - ${message} ${JSON.stringify(optionalParams)}\n`;

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to write to log', err);
            return res.status(500).send('Failed to log message');
        }
        res.send('Log received');
    });
});

const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Redefine console.log to write to both the console and the log file
const originalConsoleLog = console.log;
console.log = function(message, ...optionalParams) {
    const formattedMessage = `${new Date().toISOString()} - ${message} ${optionalParams.map(param => JSON.stringify(param)).join(' ')}\n`;
    originalConsoleLog(message, ...optionalParams);  // Keep the original console output
    logStream.write(formattedMessage);  // Write to the log file
};

// Define routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
    console.log('Home_page: Home Page Accessed');
});

app.get('/visualizing', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'visualizing.html'));
    console.log('Explain: Open Visualizing');
});

app.get('/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'calendar_year.html'));
    console.log('Calendar: Open Calendar');
});

app.get('/video', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'video.html'));
    console.log('Video: Open Video');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Ensure that the streams are closed when the application exits
process.on('exit', () => {
    logStream.end();
});

function getCurrentDateAndUTCHour() {
    var now = new Date();
    now.setTime(now.getTime() - 1.5 * 60 * 60 * 1000); // Subtract 1.5 hours

    var year = now.getUTCFullYear();
    var month = now.getUTCMonth() + 1;
    var day = now.getUTCDate();
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    var date = year + '-' + month + '-' + day;
    var hoursUTC = now.getUTCHours();
    hoursUTC = hoursUTC < 10 ? '0' + hoursUTC : hoursUTC;

    return date + "T" + hoursUTC;
}

function appendToJson(newData) {
    let data = [];
    if (fs.existsSync(JSON_FILE)) {
        const fileData = fs.readFileSync(JSON_FILE, 'utf8');
        data = JSON.parse(fileData);
    }

    const now = new Date().toISOString();
    newData.forEach(entry => {
        entry.timestamp = now;
    });
    data.push(...newData);

    fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to JSON file:', err);
        } else {
            console.log('Data successfully written to JSON file.');
        }
    });
}

function fetchData() {
    const time = getCurrentDateAndUTCHour();
    const url = URL_BASE + '&startDate=' + time + '&endDate=' + time;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched data:', data);
            appendToJson(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function checkAndFetch() {
    console.log("Checking time to fetch data");
    const now = new Date();
    console.log("Current minutes:", now.getMinutes());
    if (now.getMinutes() === 30) {
        console.log("Time to fetch data");
        fetchData();
    }
}


