var express = require('express');
const {check, validationResult} = require("express-validator");
var router = express.Router();
var bulletinModel = require('../model/bulletin');
const dbConnection = require('../model/dbConnection.js');
const sql = dbConnection.getConnection();

router.get('/', async function(req, res, next) {

    await sql`delete from bulletin_board where time < NOW();`

    const results = await sql`Select b.*, p.name 
    FROM bulletin_board b 
    JOIN profiles p
    ON b.userID = p.userID;`

    if (req.session.user != undefined) {
        res.render('bulletin', {
            bulletinBoardTitle: "Bulletin Board",
            makeAPostTitle: "Make a Post",
            loggedIn: true,
            posts: results,
        });
    }
    else {
        res.render('bulletin', {
            bulletinBoardTitle: "Bulletin Board",
            makeAPostTitle: "Make a Post",
            loggedIn: false,
            posts: results
        });
    }
});

router.post('/',[check('typeSelect').not().isEmpty().withMessage('Please select a post type'),
    check('postAddressInput').not().isEmpty().withMessage('Please enter a post address'),
    check('eventDateInput').not().isEmpty().withMessage('Please enter an event date'),
    check('eventTimeInput').not().isEmpty().withMessage('Please enter an event time'),
    check('postContentInput').not().isEmpty().withMessage('Please enter post content')
] ,async function(req, res, next){
        const errors = validationResult(req);
        const{
            typeSelect,
            postAddressInput,
            eventDateInput,
            eventTimeInput,
            postContentInput
        } = req.body;

        if(errors.isEmpty()){
            const timestamp = `${eventDateInput} ${eventTimeInput}:00`;

            var eventType = '';
            if(typeSelect == 'Community Event'){
                eventType = 'Event';
            }else(eventType = typeSelect);

            await bulletinModel.bulletin(req.session.user.id, eventType, postAddressInput, timestamp, postContentInput);

            res.redirect('/bulletin');
            
        }else{
            const error = errors.array();
            var fieldErrors = [];
            for (const e of error){
                fieldErrors.push(e.msg);
            }
            console.log(fieldErrors);
            await sql`delete from bulletin_board where time < NOW();`
            const results = await sql`Select b.*, p.name 
            FROM bulletin_board b 
            JOIN profiles p
            ON b.userID = p.userID;`
            console.log(results);
            if (req.session.user != undefined) {
                res.render('bulletin', {
                    bulletinBoardTitle: "Bulletin Board",
                    makeAPostTitle: "Make a Post",
                    //error: error,
                    fieldErrors: fieldErrors,
                    posts: results,
                    loggedIn: true
                });
            }
            else {
                res.render('bulletin', {
                    bulletinBoardTitle: "Bulletin Board",
                    makeAPostTitle: "Make a Post",
                    //error: error,
                    fieldErrors: fieldErrors,
                    posts: results,
                    loggedIn: false
                });
            }            
            return;
        }
        
})

module.exports = router;
