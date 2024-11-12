const express = require('express');
import { metrics } from './config';

const os = require('os');
totalHttp = 0;
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

function sendMetricsPeriodically(period) {
    const timer = setInterval(() => {
        try {
            const buf = new MetricBuilder();
            httpMetrics(buf);
            systemMetrics(buf);
            userMetrics(buf);
            purchaseMetrics(buf);
            authMetrics(buf);

            const metrics = buf.toString('\n');
            this.sendMetricToGrafana(metrics);
        } catch (error) {
            console.log('Error sending metrics', error);
        }
    }, period);
}

function systemMetrics(buf) {
    buf.append(getMemoryUsagePercentage);
    buf.append(getCpuUsagePercentage);
}

function sendMetricToGrafana(metrics) {

}

//total requests
function addRequest(something) {
    totalHttp++;
    //individual requests
}


function httpMetrics(buf) {
    //add each type of metric
    totalHttp = 0;
}

function authMetrics(buf) {

}

function addSuccessAuth() {
    successAuth++;
}
function addFailAuth() {
    failAuth++;
}


//Pizzas

//Latency


module.exports = { metrics, addRequest };