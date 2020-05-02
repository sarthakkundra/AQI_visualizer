//var leaf = require("leaflet");
var express = require('express');
var fetch = require('node-fetch');
var request = require('request-promise');
var request2 = require('request');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const path = require('path');

var app = express();

mongoose.connect('mongodb+srv://admin:admin@cluster0-a9rvp.mongodb.net/test?retryWrites=true&w=majority');
app.use(bodyParser.urlencoded({ extended: true }));
var citySchema = new mongoose.Schema({
    name: String
});
var cityModel = mongoose.model("City", citySchema);
//var London = new cityModel({ name: 'London' });
//London.save();

//var cityName = "London";
async function getCities(cities) {
    var aqi_data = [];

    for (var city_obj of cities) {
        var city = city_obj.name;
        var url = `http://api.waqi.info/feed/${city}/?token=66cc9b64ec97aff8a78266ca41b082edf3e9a65a`;

        var response_body = await request(url);
         var aqi = JSON.parse(response_body);
      


         fetch(url).then(res => res.json()).then(response_body => Object.values(response_body.data.iaqi).map(({v}) => v)).then(console.log)
     

        var aqiData = {
            city: aqi.data.city.name,
            aqi: aqi.data.aqi

        };

        aqi_data.push(aqiData);
    }

    return aqi_data;
}

app.get("/", function (req, res) {

    cityModel.find({}, function (err, cities) {
        getCities(cities).then(function (results) {
            console.log(results);
            var aqi_Data = { aqi_data: results };
            //const Result = Object.values(results.body.data.iaqi).map(Object.values).flat();
            //console.log(Result);
            res.render("index.ejs", aqi_Data);
        });
    });
});

app.get("/stats", (req,res) =>{
    res.sendFile(path.join(__dirname, '/comparator/index.html'));
})


app.post("/", function (req, res) {

    var newCity = new cityModel({ name: req.body.city_name });
    newCity.save();
    newCity.collection.deleteOne();
    res.redirect('/');
});





app.listen("3000", function () {
    console.log("server started");
});