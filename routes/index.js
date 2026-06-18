var express = require('express');
var router = express.Router();
var model = require('../model/index.js');
const plotInfoModel = require("../model/getPlotInfo.js");

var title = "Ladywood Spaces";

// Load page with or without plot locations
router.get('/', async function(req, res, next) {
    try{
        const locations = await model.getPlotLocation();
        res.render('index', {
        title: title,
        spaces: locations
        });
    } catch (err){
        console.error(err);
        res.render('index', {
            title: title,
            spaces:[]
        });
    }
});


// Load correct page from plot location
router.get('/plotInfo/:id', async (req, res, next) => {
    try{
        const plotInfo = await plotInfoModel.getPlotInfo(req.params.id);

        if(!plotInfo){
            return res.status(404).send('Plot not found');
        }

        if (req.session.user != undefined) {
            res.render('plotInfo', {
                title: plotInfo.name,
                info: plotInfo,
                userID: req.session.user.id
            });
        }
        else {
            res.redirect('login');
        }
    } catch(err){
        console.error("Error retrieving plot: ", err);
    }
})


module.exports = router;