const express = require('express');
const config = require('./config.js');

const os = require('os');

class Metrics {
    constructor() {
        // This will periodically sent metrics to Grafana
        const timer = setInterval(() => {
            sendMetricsPeriodically();
        }, 10000);
        timer.unref();
    }
}

totalHttp = 0;
getHttp = 0;
postHttp = 0;
putHttp = 0;
deleteHttp = 0;
successAuth = 0;
failAuth = 0;

function getCpuUsagePercentage() {
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    return cpuUsage.toFixed(2) * 100;
}

function getMemoryUsagePercentage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    return memoryUsage.toFixed(2);
}

function sendMetricsPeriodically() {

    try {
        httpMetrics();
        systemMetrics();
        // userMetrics();
        // purchaseMetrics();
        // authMetrics();

    } catch (error) {
        console.log('Error sending metrics', error);
    }
}

function systemMetrics() {
    sendMetricToGrafana('cpu', 'cpuPercentage', getCpuUsagePercentage());
    sendMetricToGrafana('memory', 'memoryPercentage', getMemoryUsagePercentage());
}

function sendMetricToGrafana(metricPrefix, metricName, metricValue) {
    const metric = `${metricPrefix},source=${config.metrics.source} ${metricName}=${metricValue}`;
    // console.log(metric);
    // console.log(config.metrics.url);
    // console.log(config.metrics.apiKey);
    // console.log(config.metrics.userId);

    fetch(`${config.metrics.url}`, {
        method: 'post',
        body: metric,
        headers: { Authorization: `Bearer ${config.metrics.userId}:${config.metrics.apiKey}` },
    })
        .then((response) => {
            if (!response.ok) {
                console.error('Failed to push metrics data to Grafana');
            } else {
                console.log(`Pushed ${metric}`);
            }
        })
        .catch((error) => {
            console.error('Error pushing metrics:', error);
        });
}


//total requests
function addRequest(req) {
    totalHttp++;
    if (req.method == "GET") {

        getHttp++;
    }
    else if (req.method == "POST") {
        postHttp++;
    }
    else if (req.method == "PUT") {
        putHttp++;
    }
    else if (req.method == "DELETE") {
        deleteHttp++;
    }
}


function httpMetrics() {
    //add each type of metric
    sendMetricToGrafana('requests', 'getHttp', getHttp);
    sendMetricToGrafana('requests', 'deleteHttp', deleteHttp);
    sendMetricToGrafana('requests', 'totalHttp', totalHttp);
    sendMetricToGrafana('requests', 'putHttp', putHttp);
    sendMetricToGrafana('requests', 'postHttp', postHttp);
    totalHttp = 0;
    getHttp = 0;
    deleteHttp = 0;
    putHttp = 0;
    postHttp = 0;

}

// function authMetrics(buf) {

// }

// function addSuccessAuth() {
//     successAuth++;
// }
// function addFailAuth() {
//     failAuth++;
// }

// processAllRequests(req) {
//     if (req.t)
// }


//Pizzas

//Latency



const metrics = new Metrics();
module.exports = { metrics, addRequest }
