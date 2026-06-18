var express = require('express');
var router = express.Router();
const listPlotModel = require('../model/listPlotInfo.js');

router.get('/', async function(req, res, next) {
    if (req.session.user != undefined) {
        res.render('listPlot', {
            title: "List a plot"
        });
    }
    else {
        console.log("User not logged in, sending back to home page");
        res.redirect('/');
    }
});

router.post('/', async function(req, res, next) {
    const userID = req.session.user.id;
    const placeName = req.body.placeName;
    const address = req.body.address + " " + req.body.postcode;
    const email = req.body.email;
    const phone = req.body.phone;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const legal = req.body.legal;

    if (legal == "on") {
        const plotID = await listPlotModel.addGrowingSpace(userID, placeName, address, startTime, endTime, phone, email);

        if(plotID){
            return res.redirect(`/plotInfo?plot=${plotID}`);
        }
        else {
            res.render('listPlot', {
                title: "List a plot",
                error: "Invalid data"
            });
        }
    }
        else {
            res.render('listPlot', {
            title: "List a plot",
            error: "Please check the box"
        });
    }
});

module.exports = router;