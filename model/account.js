const dbConnection = require('./dbConnection.js');
const sql = dbConnection.getConnection();
const bcrypt = require('bcrypt');

exports.signup = async(email, username, password) => {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    try {
        result = await sql`
            INSERT INTO account
                (email, username, password)
            VALUES
                (${email}, ${username}, ${hash});`;
        return true; // account created successfully
    }
    catch (error) {
        console.error(error);
        return false; // account not created successfully (usually if account exists already)
    }
}

exports.login = async(username, password) => {
    try {
        result = await sql`
            SELECT userID, password
            FROM account
            WHERE username = ${username};`;
        if (result == '') {
            return -1; // username not in database
        }
        else {
            for (var user of result) {
                var pass = await bcrypt.compare(password, user['password']);
                if (pass == true) {
                    return {id: user['userid'], username: username};
                }
            }
        }
    }
    catch (error) {
        console.error(error);
        return false;
    }
    return false; // invalid username/password
}