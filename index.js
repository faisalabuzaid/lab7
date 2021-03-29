'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());



app.get('/location', handleLocation);

app.get('/weather', handleWeather)


let myLocalLocations ={};
function handleLocation(request, response) {
  let city = request.query.city;
  if (myLocalLocations[city]) {
    response.send(myLocalLocations[city]);
  } else {
    let key = process.env.GEO_API_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
    superagent.get(url).then(res=> {
      const locationData = res.body[0];
      const location = new Location(city, locationData);
      myLocalLocations[city] = location;
      response.send(location);

    }).catch((err)=> {
      console.log('ERROR IN LOCATION API');
      console.log(err)
    });
  }
}
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}


let myLocalWeather = {};
function handleWeather(request, response) {
  let city = request.query.city;
  if (myLocalWeather[city]) {
    response.send(myLocalWeather[city]);
  } else {
    let key = process.env.WETH_API_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}`
    superagent.get(url).then(res => {
      console.log(res.body.data);
      const data = res.body.data.map((wData) => {
        return new Weather(wData.weather.description, wData.valid_date);
        console.log(data);
      });
      for (let i = 0; i < 8; i++) {
        data.pop();
      }
      response.send(data);
      myLocalWeather[city] = data;
    })
  }
}



function Weather(forecast, datetime) {
  this.forecast = forecast;
  this.datetime = datetime;
}


app.listen(process.env.PORT || 3000, ()=> console.log(`App is running on Server on port: ${PORT}`))
