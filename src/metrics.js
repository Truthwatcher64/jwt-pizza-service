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
        this.currentUsers = 0;

        // This will periodically sent metrics to Grafana
        const timer = setInterval(() => {
            this.sendMetricsPeriodically();
        }, 5000);
        timer.unref();
    }

    sendMetricsPeriodically() {

        try {
            this.httpMetrics();
            this.systemMetrics();
            this.userMetrics();
            // purchaseMetrics();
            this.authMetrics();

        } catch (error) {
            console.log('Error sending metrics', error);
        }
    }

    userMetrics() {
        this.sendMetricToGrafana('users', 'currentCount', this.currentUsers);
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
        console.log(this.failAuth)
        this.sendMetricToGrafana('auth', 'successful', this.successAuth);
        this.sendMetricToGrafana('auth', 'failure', this.failAuth);
        this.successAuth = 0;
        this.failAuth = 0;
    }

    addSuccessAuth() {
        this.successAuth++;
        this.currentUsers++;
    }
    addFailAuth() {
        this.failAuth++;
    }

    userLeft() {
        this.currentUsers--;
    }

    //Pizzas
    purchaseMetrics() {
        this.sendMetricToGrafana('sales', 'total', this.pizzaMade);
        this.sendMetricToGrafana('sales', 'failures', this.pizzaFailures);
        this.sendMetricToGrafana('sales', 'moneyEarned', this.sectionTotal);
        this.sendMetricToGrafana('latency', 'service', this.serviceLatency);
        this.sendMetricToGrafana('latency', 'pizzaFactory', this.pizzaTime);
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