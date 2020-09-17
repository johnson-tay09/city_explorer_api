/* eslint-disable indent */
'use strict';
require('dotenv').config();
//require modules
const express = require('express');
const superagent = require('superagent');
// do i need to install pg?-------------------
const pg = require('pg');
//assignments
const cors = require('cors');
const PORT = process.env.PORT || 3000;
//not clear what this does?--------------------
const client = new pg.Client(process.env.DATABASE_URL);

//middleware
const app = express();

app.use(cors());
// is this an empty array for our data being sent to our SQL table?----------------

//default endpoint
app.get('/', (req, res) => {
	res.send('Hello World');
});
// let searchLocations = {};
// when at /location run callback locationHandler
app.get('/location', locationHandler);

function locationHandler(req, res) {
	//safe value is assigned to column one (which is our city in this case)
	const SQL = `SELECT * FROM cities WHERE search_query = $1;`;
	//this puts our req.query.city into the $1
	const safeValues = [req.query.city];
	//check the database for query = value of row 1
	client.query(SQL, safeValues).then((results) => {
		//if there is a row that matches our query respond with it
		if (results.rowCount >= 1) {
			console.log('getting city from memory', req.query.city);
			//respond with result.
			res.status(200).json(results.rows[0]);
		} else {
			//otherwise go get the data from api
			console.log('getting city from API', req.query.city);
			//the base url for our query
			let url = `https://us1.locationiq.com/v1/search.php`;
			//sets the query params to add on to the url
			let queryObject = {
				// give it this key
				key: process.env.GEOCODE_API_KEY,
				//make city equal the input value
				city: req.query.city,
				format: 'json',
				limit: 1,
			};
			superagent
				//grab the url declared above
				.get(url)
				//add search parameters via the queryObj
				.query(queryObject)
				//create an object from the data coming back from our query
				.then((data) => {
					// take data from body array index 0
					let geoData = data.body[0];
					//create a new object called location with the following data set from query
					const location = new Location(queryObject.city, geoData);
					addLocation(location);
					//send to the front end
					res.status(200).send(location);
				})
				.catch(() => {
					res.status(500).send('Sorry, something went wrong');
				});
		}
	});
}
//make a new object with agg data from get request
function Location(city, geoData) {
	this.search_query = city;
	this.formatted_query = geoData.display_name;
	this.latitude = geoData.lat;
	this.longitude = geoData.lon;
}
//push new location to DB
function addLocation(city) {
	let SQL = `INSERT INTO cities (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);`;
	let safeValues = [
		city.search_query,
		city.formatted_query,
		city.latitude,
		city.longitude,
	];
	client
		.query(SQL, safeValues)
		.then((data) => console.log(data + 'was stored'));
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
			// console.log(trailData);
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

function startServer() {
	app.listen(PORT, () => {
		console.log('Server is listening on port', PORT);
	});
}
client
	.connect()
	.then(startServer)
	.catch((e) => console.log(e));
