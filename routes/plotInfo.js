var express = require('express');
var router = express.Router();
const plotInfoModel = require("../model/getPlotInfo")

var plotID = undefined;
var plotInfo = undefined;
let userID = -1;

var testPlants = [{name:"tomato", type:"fruit", amount:10, id:1},
    {name:"apple", type:"fruit", amount:3, id:2},
    {name:"pear", type:"fruit", amount:12, id:3},
    {name:"carrot", type:"veg", amount:18, id:4},
    {name:"lettuce", type:"veg", amount:5, id:5},
    {name:"peas", type:"veg", amount:72, id:6},
    {name:"peanuts", type:"other", amount:19, id:7},
    {name:"herbs", type:"other", amount:14, id:8},
    {name:"spinach", type:"other", amount:12, id:9}
]
var testPlotInfo = {name:"Test Plot Innit", location:"123 Test Drive, Ladywood, Birmingham", hours:"10:00-17:00", plants:testPlants, phoneNum:"07123 456789", email:"testplot@gmail.com"};

// Get Plot Info
router.get('/', async(req, res, next) => {
    if (req.session.user != undefined) {
        userID = req.session.user.id;
    }
    plotID = req.query.plot;
    if (!plotID) {return res.send("<h1> Plot not supplied. </h1>")};
    
    plotInfo = await plotInfoModel.getPlotInfo(plotID);
    if (!plotInfo.name) {return res.send("<h1> Plot not found. </h1>")};
    
    res.render("plotInfo", {title:"Plot Info", style:"/stylesheets/plotInfo.css", info:plotInfo, userID:userID});
});

// Add Plant
router.post("/add", async(req, res, next) => {
    var plantName = req.body.plantName;
    var addAmount = req.body.addAmount;
    var plantType = req.body.plantType;
    
    if (userID == plotInfo.userID) {
        var success = await plotInfoModel.addPlant(plotID, plantName, plantType, addAmount);
    }
    else {var success = false;}

    if (success) {
        res.redirect("/plotInfo?plot="+plotID);
    } else {
        res.send("<h1> Failed to add plant </h1>");
    }
})

// Remove Plant
router.post("/remove", async(req, res, next) => {
    var plantID = parseInt(req.body.remPlant);
    var remAmount = req.body.remAmount;
    var plantObj = plotInfo.plants.find(({id}) => id === plantID)
    var newAmount = plantObj.amount - remAmount;
    
    if (userID == plotInfo.userID) {
        if (newAmount > 0) {
            var success = await plotInfoModel.reducePlant(plotID, plantID, newAmount);
        } else {
            var success = await plotInfoModel.removePlant(plotID, plantID);
        }
    } else {var success = false;};
    
    if (success) {
        res.redirect("/plotInfo?plot="+plotID);
    } else {
        res.send("<h1> Failed to remove/reduce plant </h1>")
    }
})

module.exports = router;    