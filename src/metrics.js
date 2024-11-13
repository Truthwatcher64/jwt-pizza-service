const express = require('express');
const config = require('./config.js');

const os = require('os');

class Metrics {
    constructor() {


        // This will periodically sent metrics to Grafana
        const timer = setInterval(() => {
            this.sendMetricsPeriodically();
        }, 10000);
        timer.unref();
    }

    totalHttp = 0;
    getHttp = 0;
    postHttp = 0;
    putHttp = 0;
    deleteHttp = 0;
    successAuth = 0;
    failAuth = 0;

    getCpuUsagePercentage() {
        const cpuUsage = os.loadavg()[0] / os.cpus().length;
        return cpuUsage.toFixed(2) * 100;
    }

    getMemoryUsagePercentage() {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const memoryUsage = (usedMemory / totalMemory) * 100;
        return memoryUsage.toFixed(2);
    }

    sendMetricsPeriodically() {

        try {
            this.httpMetrics();
            this.systemMetrics();
            // userMetrics();
            // purchaseMetrics();
            // authMetrics();

        } catch (error) {
            console.log('Error sending metrics', error);
        }
    }

    systemMetrics(buf) {
        this.sendMetricToGrafana('cpu', 'cpuPercentage', this.getCpuUsagePercentage());
        this.sendMetricToGrafana('memory', 'memoryPercentage', this.getMemoryUsagePercentage());
    }

    sendMetricToGrafana(metricPrefix, metricName, metricValue) {
        const metric = `${metricPrefix},source=${config.metrics.source} ${metricName}=${metricValue}`;
        console.log(metric);
        console.log(config.metrics.url);
        console.log(config.metrics.apiKey);
        console.log(config.metrics.userId);

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
    addRequest(req) {
        this.totalHttp++;
        if (req.method == "GET") {
            this.getHttp++;
        }
        else if (req.method == "POST") {
            this.postHttp++;
        }
        else if (req.method == "PUT") {
            this.putHttp++;
        }
        else if (req.method == "DELETE") {
            this.deleteHttp++;
        }
    }


    httpMetrics() {
        //add each type of metric

        this.sendMetricToGrafana('requests', 'totalHttp', this.totalHttp);
        this.sendMetricToGrafana('requests', 'getHttp', this.getHttp);
        this.sendMetricToGrafana('requests', 'putHttp', this.putHttp);
        this.sendMetricToGrafana('requests', 'postHttp', this.postHttp);
        this.sendMetricToGrafana('requests', 'deleteHttp', this.deleteHttp);
        this.totalHttp = 0;
        this.getHttp = 0;
        this.deleteHttp = 0;
        this.putHttp = 0;
        this.postHttp = 0;

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
}


const metrics = new Metrics();
module.exports = metrics;