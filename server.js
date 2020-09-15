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
			console.log(data);
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
// app.get('/weather', weatherHandler);
//callback function
// function weatherHandler(req, res) {
// 	let lat = req.query.lat;
// 	let lon = req.query.lon;
// 	let key = process.env.WEATHER_API_KEY;
// 	let url = `http://api.weatherbit.io/v2.0/forecast/daily?key=${key}lat=${lat}&lon=${lon}&days=8&format=JSON`;
// 	superagent
// 		.get(url)
// 		.then((data) => console.log(data))
// 		.catch((err) => console.error(err));
// }

// function Weather(obj) {
// 	this.forecast = obj.weather.description;
// 	this.time = obj.datetime;
// }

function notFoundHandler(req, res) {
	res.status(404).send('not found!');
}
app.use('*', notFoundHandler);
app.listen(PORT, () => {
	console.log(`I am listening on port: ${PORT}`);
});
