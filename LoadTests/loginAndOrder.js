import { sleep, check, group, fail } from 'k6'
import http from 'k6/http'

export const options = {
    cloud: {
        distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
        apm: [],
    },
    thresholds: {},
    scenarios: {
        Scenario_1: {
            executor: 'ramping-vus',
            gracefulStop: '30s',
            stages: [
                { target: 5, duration: '30s' },
                { target: 10, duration: '1m30s' },
                { target: 15, duration: '30s' },
                { target: 5, duration: '30s' },
            ],
            gracefulRampDown: '30s',
            exec: 'scenario_1',
        },
    },
}

export function scenario_1() {
    let response

    group('page_1 - https://stage-pizza.spinnerserver.click/', function () {
        // Load Page
        response = http.get('https://stage-pizza.spinnerserver.click/', {
            headers: {
                accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.9',
                'cache-control': 'max-age=0',
                'if-modified-since': 'Fri, 01 Nov 2024 06:11:35 GMT',
                'if-none-match': '"380a9e7e0ce89ee0627df162c7e42083"',
                priority: 'u=0, i',
                'sec-ch-ua': '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'sec-gpc': '1',
                'upgrade-insecure-requests': '1',
            },
        })
        sleep(1)

        // Login
        response = http.put(
            'https://pizza-service.spinnerserver.click/api/auth',
            '{"email":"jace@email.com","password":"key"}',
            {
                headers: {
                    accept: '*/*',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.9',
                    'content-type': 'application/json',
                    origin: 'https://stage-pizza.spinnerserver.click',
                    priority: 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Linux"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-site',
                    'sec-gpc': '1',
                },
            }
        );
        if (!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
            console.log(response.body);
            fail('Login was *not* 200');
        }

        response = http.options('https://pizza-service.spinnerserver.click/api/auth', null, {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.9',
                'access-control-request-headers': 'content-type',
                'access-control-request-method': 'PUT',
                origin: 'https://stage-pizza.spinnerserver.click',
                priority: 'u=1, i',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
            },
        })
        sleep(1)

        // Load Menu
        response = http.get('https://pizza-service.spinnerserver.click/api/order/menu', {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.9',
                'content-type': 'application/json',
                origin: 'https://stage-pizza.spinnerserver.click',
                priority: 'u=1, i',
                'sec-ch-ua': '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'sec-gpc': '1',
            },
        })

        response = http.options('https://pizza-service.spinnerserver.click/api/order/menu', null, {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.9',
                'access-control-request-headers': 'authorization,content-type',
                'access-control-request-method': 'GET',
                origin: 'https://stage-pizza.spinnerserver.click',
                priority: 'u=1, i',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
            },
        })

        // Get Store
        response = http.get('https://pizza-service.spinnerserver.click/api/franchise', {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.9',
                'content-type': 'application/json',
                origin: 'https://stage-pizza.spinnerserver.click',
                priority: 'u=1, i',
                'sec-ch-ua': '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'sec-gpc': '1',
            },
        })

        response = http.options('https://pizza-service.spinnerserver.click/api/franchise', null, {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.9',
                'access-control-request-headers': 'authorization,content-type',
                'access-control-request-method': 'GET',
                origin: 'https://stage-pizza.spinnerserver.click',
                priority: 'u=1, i',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
            },
        })
        sleep(1)

        // Make Order
        response = http.post(
            'https://pizza-service.spinnerserver.click/api/order',
            '{"items":[{"menuId":2,"description":"Pepperoni","price":0.0042},{"menuId":4,"description":"Crusty","price":0.0028}],"storeId":"1","franchiseId":1}',
            {
                headers: {
                    accept: '*/*',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.9',
                    'content-type': 'application/json',
                    origin: 'https://stage-pizza.spinnerserver.click',
                    priority: 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Linux"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-site',
                    'sec-gpc': '1',
                },
            }
        )
        if (!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
            console.log(response.body);
            fail('Login was *not* 200');
        }

        response = http.options('https://pizza-service.spinnerserver.click/api/order', null, {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.9',
                'access-control-request-headers': 'authorization,content-type',
                'access-control-request-method': 'POST',
                origin: 'https://stage-pizza.spinnerserver.click',
                priority: 'u=1, i',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
            },
        })
        sleep(1)

        // Verify
        response = http.post(
            'https://pizza-factory.cs329.click/api/order/verify',
            '{"jwt":"eyJpYXQiOjE3MzE5MTQzNzAsImV4cCI6MTczMjAwMDc3MCwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6IjE0bk5YT21jaWt6emlWZWNIcWE1UmMzOENPM1BVSmJuT2MzazJJdEtDZlEifQ.eyJ2ZW5kb3IiOnsiaWQiOiJidXJnZWFsZSIsIm5hbWUiOiJBbGV4YW5kZXIgQnVyZ2VzcyJ9LCJkaW5lciI6eyJpZCI6MiwibmFtZSI6ImphY2UiLCJlbWFpbCI6ImphY2VAZW1haWwuY29tIn0sIm9yZGVyIjp7Iml0ZW1zIjpbeyJtZW51SWQiOjIsImRlc2NyaXB0aW9uIjoiUGVwcGVyb25pIiwicHJpY2UiOjAuMDA0Mn0seyJtZW51SWQiOjQsImRlc2NyaXB0aW9uIjoiQ3J1c3R5IiwicHJpY2UiOjAuMDAyOH1dLCJzdG9yZUlkIjoiMSIsImZyYW5jaGlzZUlkIjoxLCJpZCI6MX19.hJj7XyoLjWODfAxDw1nW2e6ki1LRezJvwX9vdavLfZ1yaIeGGv25xUqkDK3-PSGqyxhWjD2t3lmDb4OmLAlDZQQGOIxAcV-90pp-Zs-RffoSs7RBWCAl41tRHufWIql76GU1CqFh6uPsHbEed4uwhbroKviRt5jmdkJd2IXJ-e6ZZS4l20FaMuBQrquYaBU7WLvOC8nYN6HYKgglwTDxtwERKohdNRvKHrejTPlp1JFMcYnwlv-XR7ZAGSwSE5bNz5SNyR5_NRAG0u6Pg-JaFxTbjaFAObab6-PflJpktY_igmDCdv9308GQ7rHQ8fXwoqb4LOpIy-4xM_bOY7CHk9OdVWvyxuqYGezYGbsqdP_v71B8sdokIUc1JU3Qt_6jdgbGdLZ-fuhckre_ARxbaWBA5T27LYVIWFCgRY4e2ccP-zYjYLfzwHbqmqb0sZowgJA34_2z5gg-Y0FdEIOaLPrq3mQ1dIrGa9E_0GF2T7C0uS4fEjS61ZUYOx8Ie--l1vbxJUxoIvfBw0UPebWOYGlkEQahCyjQoifT45jGdGmmBysnCk9zinIDo78GalfQvkdgCe7RHDuyxP0ZPoMoI8rIVeTqamDDh0XmtqCaNjxj96i2elgn8POKPtjSWKstFZaWm_UvWFAHb2vOMyXzarX8NvhPTSw-UGfg4Jrjwrw"}',
            {
                headers: {
                    accept: '*/*',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.9',
                    'content-type': 'application/json',
                    origin: 'https://stage-pizza.spinnerserver.click',
                    priority: 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Linux"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'cross-site',
                    'sec-gpc': '1',
                },
            }
        )

        response = http.options('https://pizza-factory.cs329.click/api/order/verify', null, {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.9',
                'access-control-request-headers': 'authorization,content-type',
                'access-control-request-method': 'POST',
                origin: 'https://stage-pizza.spinnerserver.click',
                priority: 'u=1, i',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
            },
        })
    })
}

export function scenario_2() {
    http.get('https://test.k6.io')
    sleep(1)
}