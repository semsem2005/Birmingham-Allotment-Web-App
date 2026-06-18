var express = require('express');
var router = express.Router();
var accountModel = require('../model/account');

router.get('/', function(req, res, next) {
    res.render('login', {
        title: "Sign in"
    });
});

router.get('/signedUp', function(req, res, next) {
    res.render('login', {
        title: "Sign in",
        signedUp: "Account successfully created! Please login"
    });
});

router.post('/', async function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    var loggedIn = await accountModel.login(username, password);

    if (loggedIn == -1) {
        console.log("Username not in database");
        res.render("login", {
            title: "Sign in",
            error: "Invalid username or password"
        })
    }
    else if (loggedIn == false) {
        console.log("Password incorrect");
        res.render("login", {
            title: "Sign in",
            error: "Invalid username or password"
        })
    }
    else {
        console.log("Logged in");
        req.session.user = {id: loggedIn.id, username: loggedIn.username};
        res.redirect("/")
    }
});

router.post('/signedUp', async function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    var loggedIn = await accountModel.login(username, password);

    if (loggedIn == -1) {
        console.log("Username not in database");
        res.render("login", {
            title: "Sign in",
            error: "Invalid username or password"
        })
    }
    else if (loggedIn == false) {
        console.log("Password incorrect");
        res.render("login", {
            title: "Sign in",
            error: "Invalid username or password"
        })
    }
    else {
        console.log("Logged in");
        req.session.user = {id: loggedIn.id, username: loggedIn.username};
        res.redirect("/")
    }
});

module.exports = router;