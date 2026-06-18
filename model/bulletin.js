const dbConnection = require('./dbConnection.js');
const sql = dbConnection.getConnection();


//need to implement userIDS after sessions are implemented
exports.bulletin = async(userID,type, address, timestamp, content) => {
    try{

        await sql`INSERT INTO bulletin_board
            (userID, type, address, time, content)
            VALUES
            (${userID}, ${type}, ${address}, ${timestamp}, ${content});`;
    }catch (error) {
        console.error(error);
        return false;
    }
}
