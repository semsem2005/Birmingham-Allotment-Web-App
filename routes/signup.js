var express = require('express');
const {check, validationResult} = require("express-validator");
var router = express.Router();
var accountModel = require('../model/account');

router.get('/', function(req, res, next) {
    res.render('signup', {
        title: "Sign up"
    });
});

router.post('/', [
  check('username').notEmpty().isLength({min:3, max:128}).withMessage('Username must be at least 3 characters'),
  check('email').notEmpty().isEmail().withMessage('Invalid email format'),
  check('password').notEmpty().isLength({min:5, max:256}).withMessage('Password must be at least 5 characters'),
  check('password').notEmpty().matches(/\S*[a-z]\S*/).withMessage('Password must include a lowercase letter'),
  check('password').notEmpty().matches(/\S*[A-Z]\S*/).withMessage('Password must include a uppercase letter'),
  check('password').notEmpty().matches(/\S*[0-9]\S*/).withMessage('Password must include a digit'),
  check('password').notEmpty().matches(/\S*[!.@#$£%^&*\-_=+?]\S*/).withMessage('Password must include a special character')
], async function(req, res, next) {
    const errors = validationResult(req);
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body.confirmpassword;

    if (errors.isEmpty()) {
        if (password == confirmPassword) {
            if (await accountModel.signup(email, username, password) == true) {
                console.log("Account signed up");
                res.redirect('../login/signedUp');
            }
            else {
                console.log("User already exists");
                res.render('signup', {
                    title: "Sign up",
                    error: "Account already exists"
                });
            }
        }
        else {
            res.render('signup', {
                title: "Sign up",
                error: "Passwords must match"
            });
        }
    }
    else {
        const error = errors.array();
        var fieldErrors = [];
        for (const e of error) {
            fieldErrors.push(e.msg);
        }
        console.log(fieldErrors);
        res.render('signup', {
            title: "Sign up",
            fieldErrors: fieldErrors
        });
        return;
    }
});

module.exports = router;