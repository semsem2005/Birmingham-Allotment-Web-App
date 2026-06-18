const dbConnection = require('./dbConnection.js');
const sql = dbConnection.getConnection();

exports.getFruits = async() => {
    try {
        result = await sql`
            SELECT plant_name
            FROM plant_types
            WHERE plant_type = 'Fruit';`;
        return result;
    }
    catch (error) {
        console.error(error);
        return false;
    }
}

exports.getVegetables = async() => {
    try {
        result = await sql`
            SELECT plant_name
            FROM plant_types
            WHERE plant_type = 'Vegetable';`;
        return result;
    }
    catch (error) {
        console.error(error);
        return false;
    }
}

exports.getOthers = async() => {
    try {
        result = await sql`
            SELECT plant_name
            FROM plant_types
            WHERE plant_type = 'Other';`;
        return result;
    }
    catch (error) {
        console.error(error);
        return false;
    }
}

exports.addGrowingSpace = async(userID, place_name, address, open_time, close_time, phone_number, email) => {
    try {
        result = await sql`
            INSERT INTO growing_spaces
                (userID, place_name, address, open_time, close_time, phone_number, email)
            VALUES
                (${userID}, ${place_name}, ${address}, ${open_time}, ${close_time}, ${phone_number}, ${email})
                RETURNING spaceid;`;
        return result[0].spaceid;
    }
    catch (error) {
        console.error(error);
        return false;
    }
}