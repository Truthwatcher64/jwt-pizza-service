const config = require('./config.js');

class Logger {
    httpLogger = (req, res, next) => {
        console.log("Here");
        let send = res.send;
        res.send = (resBody) => {
            const logData = {
                authorized: !!req.headers.authorization,
                path: req.path,
                method: req.method,
                statusCode: res.statusCode,
                reqBody: JSON.stringify(req.body),
                resBody: JSON.stringify(resBody),
            };
            const level = this.statusToLogLevel(res.statusCode);
            this.log(level, 'http', logData);
            res.send = send;
            return res.send(resBody);
        };
        console.log(req.body);
        next();
    };

    log(level, type, logData) {
        const labels = { component: config.logger.source, level: level, type: type };
        const values = [this.nowString(), this.sanitize(logData)];
        const logEvent = { streams: [{ stream: labels, values: [values] }] };

        this.sendLogToGrafana(logEvent);
    }

    statusToLogLevel(statusCode) {
        if (statusCode >= 500) return 'error';
        if (statusCode >= 400) return 'warn';
        return 'info';
    }

    nowString() {
        return (Math.floor(Date.now()) * 1000000).toString();
    }

    sanitize(logData) {
        logData = JSON.stringify(logData);
        return logData.replace(/\\"password\\":\s*\\"[^"]*\\"/g, '\\"password\\": \\"*****\\"');
    }

    sendLogToGrafana(event) {
        const body = JSON.stringify(event);
        fetch(`${config.logger.url}`, {
            method: 'post',
            body: body,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.logger.userId}:${config.logger.apiKey}`,
            },
        }).then((res) => {
            if (!res.ok) {
                console.log('Failed to send log to Grafana');
                console.log(res);
            }
        });
    }
}
module.exports = new Logger();



// HTTP requests
// HTTP method, path, status code
// If the request has an authorization header
// Request body
// Response body

// Database requests
// SQL queries

// Factory service requests

// Any unhandled exceptions
// Sanitize all log entries so that they do not contain any confidential information