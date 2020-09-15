/* eslint-disable indent */
'use strict';
//require and assign express
const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors());

//function to get aggregated location data
app.get('/location', locationHandler);
//callback function
function locationHandler(req, res) {
	if (req.query.city === 'lynwood') {
		const locationData = require('./data/location.json');
		const city = req.query.city;
		let cityObj = new City(city, locationData);
		//   console.log(cityObj);
		res.send(cityObj);
	} else {
		return res.status(500).send('Sorry, something went wrong');
	}
}

// function to get aggregated weather data
app.get('/weather', weatherHandler);
//callback function
function weatherHandler(req, res) {
	try {
		//path to the weather data
		const weatherData = require('./data/weather.json');
		//empty array to push weather objects into
		let weatherArray = [];
		//for each loop for weather.json data objects (there are 5)
		weatherData.data.forEach((value) => {
			//run each object through our constructor
			let weatherObj = new Weather(value);
			//push each weather object into our array
			weatherArray.push(weatherObj);
		});
		// console.log(weatherObj);
		res.send(weatherArray);
	} catch (err) {
		return res.sendStatus(500);
	}
}

function Weather(obj) {
	this.forecast = obj.weather.description;
	this.time = obj.datetime;
}

function City(city, obj) {
	this.search_query = city;
	this.formatted_query = obj[0].display_name;
	this.latitude = obj[0].lat;
	this.longitude = obj[0].lon;
}

app.listen(PORT, () => {
	console.log(`I am listening on port: ${PORT}`);
});
