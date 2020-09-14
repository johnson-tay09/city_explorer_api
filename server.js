'use strict';
//require and assign express
const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors());

app.get('/location', locationHandler);
//callback function
function locationHandler(req, res) {
  try {
    const locationData = require('./data/location.json');
    const city = req.query.city;
    let cityObj = new City(city, locationData);
    //   console.log(cityObj);
    res.send(cityObj);
  } catch (error) {
    console.error(error);
  }
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
