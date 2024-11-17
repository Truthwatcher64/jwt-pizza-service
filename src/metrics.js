const config = require('./config.js');
const os = require('os');

class Metrics {


    constructor() {
        this.totalHttp = 0;
        this.getHttp = 0;
        this.postHttp = 0;
        this.putHttp = 0;
        this.deleteHttp = 0;
        this.successAuth = 0;
        this.failAuth = 0;
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
        this.sendMetricToGrafana('requests', 'getHttp', this.getHttp);
        this.sendMetricToGrafana('requests', 'deleteHttp', this.deleteHttp);
        this.sendMetricToGrafana('requests', 'totalHttp', this.totalHttp);
        this.sendMetricToGrafana('requests', 'putHttp', this.putHttp);
        this.sendMetricToGrafana('requests', 'postHttp', this.postHttp);
        this.totalHttp = 0;
        this.getHttp = 0;
        this.deleteHttp = 0;
        this.putHttp = 0;
        this.postHttp = 0;
        this.pizzaMade = 0;
        this.sectionTotal = 0;
        this.pizzaFailures = 0;
        this.serviceLatency = 0;
        this.pizzaTime = 0;
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
        this.successAuth = 0;
        this.failAuth = 0;
    }

    addSuccessAuth() {
        this.console.log("authentication");
        this.successAuth++;
    }
    addFailAuth() {
        this.console.log("authentication");
        this.failAuth++;
    }

    //Pizzas
    purchaseMetrics() {
        this.sendMetricToGrafana('sales', 'total', pizzaMade);
        this.sendMetricToGrafana('sales', 'failures', pizzaFailures);
        this.sendMetricToGrafana('sales', 'moneyEarned', sectionTotal);
        this.sendMetricToGrafana('latency', 'service', serviceLatency);
        this.sendMetricToGrafana('latency', 'pizzaFactory', pizzaTime);
        this.pizzaMade = 0;
        this.pizzaFailures = 0;
        this.sectionTotal = 0;
        this.serviceLatency = 0;
        this.pizzaTime = 0;
    }

    orderMadeRecord() {
        this.pizzaMade++;
    }

    pizzaMakesFailed() {
        this.pizzaFailures++;
    }

    moneyMade(moreMoney) {
        this.sectionTotal = this.sectionTotal + moreMoney;
    }

    //Latency
    backEndLatency(time) {
        if (this.serviceLatency == 0) {
            this.serviceLatency = time;
        }
        else {
            this.serviceLatency = (this.serviceLatency + time) / 2;
        }

    }

    pizzaCreationTime(time) {
        if (this.pizzaTime == 0) {
            this.pizzaTime = time;
        }
        else {
            this.pizzaTime = (this.pizzaTime + time) / 2;
        }
    }
}

const metrics = new Metrics();
module.exports = metrics;