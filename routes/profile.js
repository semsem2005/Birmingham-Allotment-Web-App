var express = require('express');
var router = express.Router();
var db = require('../model/dbConnection');
var plotInfoModel = require('../model/getPlotInfo');

// GET /profile
router.get('/', async function(req, res) {
    if (req.session.user == undefined) return res.redirect('/login');
    const userID = req.session.user.id; 

    try {
        const sql = db.getConnection();
        const rows = await sql`
            SELECT a.username, a.email, p.name, p.gender, p.bio, p.dark_mode
            FROM account a
            JOIN profiles p ON a.userID = p.userID
            WHERE a.userID = ${userID}
        `;

        if (rows.length === 0) return res.redirect('/login');

        const plots = await plotInfoModel.getUserPlots(userID);

        res.render('profile', {
            title: 'Profile',
            user: rows[0],
            plots: plots
        });
    } catch (err) {
        console.error(err);
        res.render('profile', { title: 'Profile', user: {}, plots: [], error: 'Failed to load profile.' });
    }
});

// POST /profile
router.post('/', async function(req, res) {
    
    const userID = req.session.user.id;

    const plots = await plotInfoModel.getUserPlots(userID);

    const { username, email, password, confirmPassword, currentPassword, name, gender, bio } = req.body;
    const dark_mode = req.body.dark_mode === 'on';

    if (!username || !email) {
        return res.render('profile', {
            title: 'Profile',
            user: { username, email, name, gender, bio, dark_mode},
            error: 'Username and email are required.'
        });
    }

    if (password && password !== confirmPassword) {
        return res.render('profile', {
            title: 'Profile',
            user: { username, email, name, gender, bio, dark_mode},
            error: 'Passwords do not match.'
        });
    }

    try {
        const sql = db.getConnection();

        if (password) {
            if (!currentPassword) {
                return res.render('profile', {
                    title: 'Profile',
                    user: { username, email, name, gender, bio, dark_mode},
                    error: 'Please enter your current password to set a new one.'
                });
            }

            const result = await sql`SELECT password FROM account WHERE userID = ${userID}`;
            const bcrypt = require('bcrypt');
            const match = await bcrypt.compare(currentPassword, result[0].password);

            if (!match) {
                return res.render('profile', {
                    title: 'Profile',
                    user: { username, email, name, gender, bio, dark_mode},
                    error: 'Current password is incorrect.'
                });
            }

            const hashed = await bcrypt.hash(password, 10);
            await sql`
                UPDATE account
                SET username = ${username}, email = ${email}, password = ${hashed}
                WHERE userID = ${userID}
            `;
        } else {
            await sql`
                UPDATE account
                SET username = ${username}, email = ${email}
                WHERE userID = ${userID}
            `;
        }

        await sql`
            UPDATE profiles
            SET name = ${name || null}, gender = ${gender || null}, bio = ${bio || null}, dark_mode = ${dark_mode ? true : false}
            WHERE userID = ${userID}
        `;

        res.render('profile', {
            title: 'Profile',
            user: { username, email, name, gender, bio, dark_mode },
            plots: plots,
            success: true
        });
    } catch (err) {
        console.error(err);
        let error = 'Failed to save changes.';
        if (err.code === '23505') {
            error = err.detail.includes('username')
                ? 'That username is already taken.'
                : 'That email is already in use.';
        }
        res.render('profile', {
            title: 'Profile',
            user: { username, email, name, gender, bio, dark_mode },
            plots: plots,
            error
        });
    }
});

module.exports = router;