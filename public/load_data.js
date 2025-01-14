const fs = require('fs');
const fetch = require('node-fetch');

const API_KEY = 'BB66CD77-8E6B-465B-9AC0-AD602FBC8827';
const BBOX = '-84.3,33.690,-84.2,33.691';
const PARAMETERS = 'OZONE,PM25,PM10,CO,NO2,SO2';
const URL_BASE = 'https://www.airnowapi.org/aq/data/?parameters=' + PARAMETERS + '&BBOX=' + BBOX + '&dataType=B&format=application/json&verbose=1&monitorType=0&includerawconcentrations=1&API_KEY=' + API_KEY;
const JSON_FILE = 'air_quality_data.json';

function getCurrentDateAndUTCHour() {
    // Create a new Date object for the current date and time
    var now = new Date();
    now.setTime(now.getTime() - 1.5 * 60 * 60 * 1000); // Subtract 1.5 hours

    // Fetch the year, month, and day
    var year = now.getUTCFullYear(); // Get the year as a four digit number (yyyy)
    var month = now.getUTCMonth() + 1; // Get the month as a number (0-11), add 1 to make it 1-12
    var day = now.getUTCDate(); // Get the day as a number (1-31)

    // Format the month and day to ensure two digits (e.g., '01' instead of '1')
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    // Combine into a date string in YYYY-MM-DD format
    var date = year + '-' + month + '-' + day;

    // Fetch UTC hour
    var hoursUTC = now.getUTCHours();
    hoursUTC = hoursUTC < 10 ? '0' + hoursUTC : hoursUTC; // Format the UTC hour to ensure two digits

    return date + "T" + hoursUTC;
}

function appendToJson(newData) {
    let data = [];

    // Read existing data if the file exists
    if (fs.existsSync(JSON_FILE)) {
        const fileData = fs.readFileSync(JSON_FILE);
        data = JSON.parse(fileData);
    }

    // Append new data
    const now = new Date().toISOString();
    newData.forEach(entry => {
        entry.timestamp = now;
    });
    data.push(...newData);

    // Write updated data back to the file
    fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), (err) => {
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
            console.log(data);
            appendToJson(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function checkAndFetch() {
    const now = new Date();
    if (now.getMinutes() === 30) {
        fetchData();
    }
}

// Check every minute
setInterval(checkAndFetch, 60000);
