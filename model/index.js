const postgres = require("postgres");
const dbConnection = require('./dbConnection.js');
const sql = dbConnection.getConnection();
// const L = require('leaflet');


// Get plot location from db
exports.getPlotLocation = async() => {
    try {
        const result = await sql `SELECT spaceid, place_name, address FROM growing_spaces`;

    
    return result}
    catch (err){
        console.error("Cannot get get location: " + err);
        return false;
    }
}

