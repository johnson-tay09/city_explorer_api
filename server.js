/* eslint-disable indent */
'use strict';
require('dotenv').config();
//require modules
const express = require('express');
const superagent = require('superagent');
//assignments
const cors = require('cors');
const PORT = process.env.PORT || 3000;
//middleware
const app = express();

app.use(cors());
//default endpoint
app.get('/', (req, res) => {
	res.send('Hello World');
});
//when at /location run callback locationHandler
app.get('/location', locationHandler);
//this function reaches out to another site in order to get data and serve it to our user
function locationHandler(req, res) {
	let city = req.query.city;
	let key = process.env.GEOCODE_API_KEY;
	const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
	//helper library to fetch data
	superagent
		//get request to outside site
		.get(url)
		//grab data from outside url
		.then((data) => {
			// console.log(data);
			//specify index of object array you want to extract data from
			const geoData = data.body[0];
			//create our own location object with aggregated data via constructor
			const location = new Location(city, geoData);
			//serve our user agg data
			res.send(location);
		})
		.catch((err) => {
			console.log('ERROR', err);
			res.status(500).send('Sorry, something went wrong.');
		});
}
//make a new object with agg data from get request
function Location(city, geoData) {
	this.search_query = city;
	this.formatted_query = geoData.display_name;
	this.latitude = geoData.lat;
	this.longitude = geoData.lon;
}
// function to get aggregated weather data
app.get('/weather', weatherHandler);
// callback function
function weatherHandler(req, res) {
	let lat = req.query.latitude;
	let lon = req.query.longitude;
	// console.log(req.query);
	let key = process.env.WEATHER_API_KEY;
	let url = `http://api.weatherbit.io/v2.0/forecast/daily?key=${key}&lat=${lat}&lon=${lon}&days=8&format=JSON`;
	superagent
		//request from outside site
		.get(url)
		//grab data from url
		.then((value) => {
			// console.log(value);
			//use map to build an array for each obj
			const weatherData = value.body.data.map((obj) => {
				return new Weather(obj);
			});
			res.send(weatherData);
		})
		.catch((err) => {
			console.log('ERROR', err);
			res.status(500).send('Sorry, something went wrong.');
		});
}

function Weather(obj) {
	this.forecast = obj.weather.description;
	this.time = obj.datetime;
}

// function to get aggregated weather data
app.get('/trails', trailHandler);
// callback function
function trailHandler(req, res) {
	let lat = req.query.latitude;
	let lon = req.query.longitude;
	// console.log(req.query);
	let key = process.env.HIKING_API_KEY;
	let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;

	superagent
		//request from outside site
		.get(url)
		//grab data from url
		.then((value) => {
			// console.log(value.body);
			//use map to build an array for each obj
			const trailData = value.body.trails.map((obj) => {
				return new Trail(obj);
			});
			console.log(trailData);
			res.send(trailData);
		})
		.catch((err) => {
			console.log('ERROR', err);
			res.status(500).send('Sorry, something went wrong.');
		});
}

function Trail(obj) {
	this.name = obj.name;
	this.location = obj.location;
	this.length = obj.length;
	this.star_votes = obj.starVotes;
	this.summary = obj.summary;
	this.trail_url = obj.url;
	this.conditions = obj.conditionDetails;
	this.condition_date = obj.conditionDate.slice(0, 9);
	this.condition_time = obj.conditionDate.slice(11, 19);
}

function notFoundHandler(req, res) {
	res.status(404).send('not found!');
}
app.use('*', notFoundHandler);
app.listen(PORT, () => {
	console.log(`I am listening on port: ${PORT}`);
});
