const config = require('./config.js');
const os = require('os');

class Metrics {
    constructor() {
        this.totalRequests = 0;

        // This will periodically sent metrics to Grafana
        const timer = setInterval(() => {
            this.sendMetricsPeriodically();
        }, 10000);
        timer.unref();
    }

    sendMetricsPeriodically() {

        try {
            this.httpMetrics();
            this.systemMetrics();
            // // userMetrics();
            // purchaseMetrics();
            // authMetrics();

        } catch (error) {
            console.log('Error sending metrics', error);
        }
    }

    httpMetrics() {
        //add each type of metric
        this.sendMetricToGrafana('requests', 'getHttp', getHttp);
        this.sendMetricToGrafana('requests', 'deleteHttp', deleteHttp);
        this.sendMetricToGrafana('requests', 'totalHttp', totalHttp);
        this.sendMetricToGrafana('requests', 'putHttp', putHttp);
        this.sendMetricToGrafana('requests', 'postHttp', postHttp);
        totalHttp = 0;
        getHttp = 0;
        deleteHttp = 0;
        putHttp = 0;
        postHttp = 0;
    }

    systemMetrics() {
        this.sendMetricToGrafana('cpu', 'cpuPercentage', this.getCpuUsagePercentage());
        this.sendMetricToGrafana('memory', 'memoryPercentage', this.getMemoryUsagePercentage());
    }

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


    totalHttp = 0;
    getHttp = 0;
    postHttp = 0;
    putHttp = 0;
    deleteHttp = 0;
    successAuth = 0;
    failAuth = 0;

    //total requests
    addRequest(req) {
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

    sendMetricToGrafana(metricPrefix, metricName, metricValue) {
        const metric = `${metricPrefix},source=${config.metrics.source} ${metricName}=${metricValue}`;
        fetch(`${config.metrics.url}`, {
            method: 'post',
            body: metric,
            headers: { Authorization: `Bearer ${config.metrics.userId}:${config.metrics.apiKey}` },
        })
            .then((response) => {
                if (!response.ok) {
                    console.error('Failed to push metrics data to Grafana');
                } else {
                    //console.log(`Pushed ${metric}`);
                }
            })
            .catch((error) => {
                console.error('Error pushing metrics:', error);
            });
    }

    authMetrics() {
        this.sendMetricToGrafana('auth', 'successful', successAuth);
        this.sendMetricToGrafana('auth', 'failure', failAuth);
        successAuth = 0;
        failAuth = 0;
    }

    addSuccessAuth() {
        successAuth++;
    }
    addFailAuth() {
        failAuth++;
    }
}

const metrics = new Metrics();
module.exports = metrics;