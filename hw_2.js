import http from 'k6/http';
import { check } from "k6";

export const options = {
	out: 'influxdb=http://localhost:8086/k6',
	scenarios: {
		ya_scenario: {
			executor: 'ramping-arrival-rate',
			exec: 'get_ya',
			startRate: 0,
			timeUnit: '1m',
			preAllocatedVUs: 0,
			maxVUs: 120,
			stages: [
				{ target: 60, duration: '5m' },
				{ target: 60, duration: '10m' },
				{ target: 72, duration: '5m' },
				{ target: 72, duration: '10m' },
			]
		},
		www_scenario: {
			executor: 'ramping-arrival-rate',
			exec: 'get_www',
			startRate: 0,
			timeUnit: '1m',
			preAllocatedVUs: 0,
			maxVUs: 120,
			stages: [
				{ target: 120, duration: '5m' },
				{ target: 120, duration: '10m' },
				{ target: 144, duration: '5m' },
				{ target: 144, duration: '10m' },
			]
		},
	}
}
// 5m -> 100%
// 10m = 100%
// 5m -> 120%
// 10m = 120%
export default function(){
	
}

export function get_ya(){
	const res = http.get('https://ya.ru/'); // 60 rpm
	check(res, {
        "ya.ru: status code is 200": (res) => res.status == 200,
    });
}

export function get_www(){
	http.get('http://www.ru/'); // 120 rpm
}
