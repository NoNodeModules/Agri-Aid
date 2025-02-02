const express = require("express");
const ejs = require("ejs");
const lodash = require("lodash");
const https = require("https");
const alert = require("alert");
const mongoose = require("mongoose");
const { raw } = require("express");
const { parseInt } = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb://localhost:27017/farmAid", {useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    f_name : String,
    l_name : String,
    email : String,
    phone : String,
    address_1 : String,
    address_2 : String,
    person_name : String,
    city : String,
    state : String,
    zip : Number,
    booking_date : Date
});

const User = mongoose.model("User", userSchema);

function toCelcius(temp){
    return String(Math.round(temp - 273.16));
}

cities = {  "Vadodara" : "vd", 
            "Chennai" : "ch", 
            "Mumbai" : "mu", 
            "Delhi" : "de", 
            "Nagpur" : "na",
            "Shimla" : "sh"
        };

app.get("/", function(req, res){
    res.render("index");
});

app.get("/soil-check", function(req, res){
    res.render("soil-check");
});

app.get("/water-check", function(req, res){
    res.render("water-check");
});

app.get("/food-check", function(req, res){
    res.render("food-check");
});

app.get("/seed-check", function(req, res){
    res.render("seed-check");
});

app.get("/market-price", function(req, res){
    res.render("market-price");
});

app.get("/dealer", function(req, res){
    res.render("dealer");
});

app.get("/form", function(req, res){
    res.render("form");
});

app.post("/form-send", function(req, res){
    const f_name = req.body.f_name;
    const l_name = req.body.l_name;
    const email = req.body.email;
    const phone = req.body.phone_number;
    const address_1 = req.body.address_1;
    const address_2 = req.body.address_2;
    const person_name = req.body.service;
    const city = req.body.city;
    const state = req.body.state;
    const zip = req.body.zip_code;

    const newUser = new User({
        f_name : f_name,
        l_name : l_name,
        email : email,
        phone : phone,
        address_1 : address_1,
        address_2 : address_2,
        person_name : person_name,
        city : city,
        state : state,
        zip : zip,
        booking_date : new Date()
    });

    newUser.save();
    alert("Your Booking has been Successfully done");
    res.redirect("/dealer");
});

app.get("/revenue-predictor", function(req, res){
    if(req.query.production){
        const prod = parseInt(req.query.production);
        const selling_price = parseInt(req.query.selling_price);
        const cost_price = parseInt(req.query.cost_price);
        const add_price = parseInt(req.query.additional_cost);
        const val = (prod * selling_price) - cost_price - add_price;
        res.render("revenue-predictor", {
            data: val
        });
    }
    else{
        res.render("revenue-predictor", {
            data: 0
        });
    }
});

app.get("/news", function(req, res){
    res.render("news");
});

app.get("/support", function(req, res){
    res.render("support");
});

app.get("/weather", function(req, res){
    res.render("weather");
});

app.post("/weather", function(req, res){
    const query = req.body.city;
    if(query == "" || query == null){
        res.redirect("weather");
    }
    else{
        const query1 = lodash.capitalize(query);
        if(!cities[query1]){
            alert("Enter a Valid Indian City");
            res.redirect("/weather");
        }
        else{
            const apikey = "1698a076f54bd4a9cd70ad24c66c512c";
            const url = "https://api.openweathermap.org/data/2.5/weather?q="+ query +"&appid="+apikey;
            https.get(url, function(response){
                response.on("data", (d) =>{

                    const weatherData =JSON.parse(d);
                    const temp = weatherData.main.temp;
                    const icon = weatherData.weather[0].icon;
                    const imgURL = "http://openweathermap.org/img/wn/"+icon+"@2x.png";
                    const lat = weatherData.coord.lat;
                    const lon = weatherData.coord.lon;
                    const temp_cel = toCelcius(temp);
                    const pressure = weatherData.main.pressure;
                    const humidity = weatherData.main.humidity;
                    const cityname = weatherData.name;
                    const cityid = weatherData.id;
                    const countryName = weatherData.sys.country;
                    const feels = weatherData.main.feels_like;
                    const max_temp = weatherData.main.temp_max;
                    const min_temp = weatherData.main.temp_min;
                    
                    res.render("weather_op", {
                        coordinate_lat : lat,
                        coordinate_lon : lon,
                        temp : temp,
                        img: imgURL,
                        temp_cel : temp_cel,
                        pressure : pressure,
                        humidity : humidity,
                        cityname : cityname,
                        cityid : cityid,
                        countryName : countryName,
                        feel_like: feels,
                        max_temp : max_temp,
                        min_temp : min_temp
                    });
                });
            });
        }
    }
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server started on port 3000");
});
