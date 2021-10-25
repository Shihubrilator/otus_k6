import { findBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';
import http from "k6/http";
import { check, group } from "k6";


const BASE_URL = 'http://www.load-test.ru:1080';
const LOGIN = 'biba'
const PASSWORD = '111111'

export let options = {
    scenarios: {
      base: {
		executor: 'per-vu-iterations',
		vus: 1,
		iterations: 1,
		maxDuration: '1h30m',
      },
    },
};


export default function(){
	get_base();
	login();
	flights();
};

export function get_base(){
    let res = http.get(BASE_URL + "/webtours");
    check(res, {
        "base: status code is 200": (res) => res.status == 200,
    });
};

export function login(){
	http.get(BASE_URL + "/cgi-bin/welcome.pl?signOff=true");
	
	let res = http.get(BASE_URL + "/cgi-bin/nav.pl?in=home");
	const user_session = findBetween(res.body, 'name="userSession" value="', '"/>');
	
	let params = {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	};
	let formData = {
		'userSession': user_session,
		'username': LOGIN,
		'password': PASSWORD,
		'login.x': 10,
		'login.y': 10,
		'JSFormSubmit': 'off'
	};
	res = http.post(BASE_URL + "/cgi-bin/login.pl", formData, params);
	const title = findBetween(res.body, '<title>', '</title>');
	check(title, {
		"login: title is Web Tours": (title) => title == 'Web Tours',
	});
};

export function flights(){
	let res = http.get(BASE_URL + "/cgi-bin/reservations.pl?page=welcome");
	let doc = res.html();
	const city_list = doc
						.find("select[name=\"depart\"] option")
						.toArray();
	const city_d = randomItem(city_list);
	const city_a = randomItem(city_list);
	
	//console.log(city_d);
	//console.log(city_a);

	let formData = {
		'advanceDiscount': 0,
		'depart': city_d,
		'departDate': ' 10/22/2021',
		'arrive': city_a,
		'returnDate': ' 10/23/2021',
		'numPassengers': 1,
		'seatPref': 'None',
		'seatType': 'Coach',
		'findFlights.x': 10,
		'findFlights.y': 10,
		'.cgifields': 'roundtrip',
		'.cgifields': 'seatType',
		'.cgifields': 'seatPref'
	};
	let params = {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	};
	res = http.post(BASE_URL + "/cgi-bin/reservations.pl", formData, params);
	
	doc = res.html();
	const flight_list = doc
							.find("input[name=\"outboundFlight\"]")
							.toArray();
	const flight = randomItem(flight_list);
	//console.log(flight);
	
	formData = {
		'outboundFlight': flight,
		'numPassengers': 1,
		'advanceDiscount': 0,
		'seatType': 'Coach',
		'seatPref': 'None',
		'reserveFlights.x': 10,
		'reserveFlights.y': 110
	}
	res = http.post(BASE_URL + "/cgi-bin/reservations.pl", formData, params);
	
	formData = {
		'firstName': '',
		'lastName': '',
		'address1': '',
		'address2': '',
		'pass1':  '',
		'creditCard': '',
		'expDate': '',
		'oldCCOption': '',
		'numPassengers': 1,
		'seatType': 'Coach',
		'seatPref': 'None',
		'outboundFlight': flight,
		'advanceDiscount': 0,
		'returnFlight': '',
		'JSFormSubmit': 'off',
		'buyFlights.x': 10,
		'buyFlights.y': 10,
		'.cgifields': 'saveCC'
	}
	res = http.post(BASE_URL + "/cgi-bin/reservations.pl", formData, params);
	
	res = http.post(BASE_URL + "/cgi-bin/welcome.pl?page=menus");
	res = http.post(BASE_URL + "/cgi-bin/login.pl?intro=true");
	check(res, {
        "flights: status code is 200": (res) => res.status == 200,
    });
}
