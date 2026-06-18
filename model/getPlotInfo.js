const postgres = require("postgres");
const dbConnection = require('./dbConnection.js');
const sql = dbConnection.getConnection();

exports.getPlotInfo = async (plotID) => {
    try {
        var retData = {};
        plotData = await sql`SELECT * FROM growing_spaces WHERE spaceid = ${plotID}`;
        for (var plot of plotData) {
            retData.name = plot['place_name'];
            retData.userID = plot['userid']
            retData.location = plot['address'];
            retData.hours = plot['open_time']+"-"+plot['close_time'];
            retData.phoneNum = plot['phone_number'];
            retData.email = plot['email'];
        }

        plants = [];
        plantData = await sql`SELECT * FROM growing_space_plants WHERE spaceid = ${plotID}`;
        for (var plant of plantData) {
            plants.push({id:plant['plantid'], amount:plant['amount_planted']});
        }

        plantInfo = await sql`SELECT * FROM plant_types`;

        for (var info of plantInfo) {
            try {
                var p = plants.find(({id}) => id===info['plantid']);
                p.name = info['plant_name'];
                p.type = info['plant_type'];
            } catch(e) {} // No error handling needed, plant just doesn't exist
        }

        retData.plants = plants;
        
        return retData;
    }
    catch (error) {
        console.error(error);
        return false;
    }
}

exports.addPlant = async(plotID, plantName, plantType, amount) => {
    try {
        await sql`SELECT add_plant_to_growing_space(${plotID}, ${plantName}, ${plantType}, ${amount})`;
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
}

exports.reducePlant = async(plotID, redPlantID, amount) => {
    try {
        await sql`UPDATE growing_space_plants SET amount_planted = ${amount} WHERE spaceID = ${plotID} AND plantID = ${redPlantID};`
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

exports.removePlant = async(plotID, remPlantID) => {
    try {
        await sql`DELETE FROM growing_space_plants WHERE spaceID = ${plotID} AND plantID = ${remPlantID}`
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

exports.getUserPlots = async (userID) => {
    try{
        return await sql `SELECT spaceid, place_name FROM growing_spaces WHERE userid=${userID} ORDER BY spaceid DESC;`;
    }
    catch(error){
        console.error(error);
        return [];
    }
} 
