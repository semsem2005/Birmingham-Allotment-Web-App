CREATE TABLE account (
    userID      SERIAL PRIMARY KEY,
    username    VARCHAR(128) NOT NULL UNIQUE,
    email       VARCHAR(256) NOT NULL UNIQUE CHECK (email LIKE '_%@_%._%'),
    password    VARCHAR(256) NOT NULL
);



--ADDED
CREATE TABLE profiles(
    userID INTEGER PRIMARY KEY,
    FOREIGN KEY (userID) REFERENCES account(userID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    name VARCHAR(128),
    gender VARCHAR(20)
        CHECK (gender IN ('Male', 'Female', 'Other')),
    bio VARCHAR(512),
    allotments_owned INTEGER DEFAULT 0,
    allotments_joined INTEGER DEFAULT 0
);



CREATE TABLE growing_spaces(
    spaceID SERIAL PRIMARY KEY,
    userID INTEGER NOT NULL,
    FOREIGN KEY (userID) REFERENCES account(userID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    place_name VARCHAR(256) NOT NULL,
    address VARCHAR(512) NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(256) NOT NULL CHECK (email LIKE '_%@_%._%'),
    FOREIGN KEY (email) REFERENCES account(email)
        ON DELETE CASCADE ON UPDATE CASCADE
);


--TABLE FOR DIFFERENT TYPES OF PLANTS
--OTHERWISE THE DB IS NOT NORMALIZED 
CREATE TABLE plant_types(
    plantID SERIAL PRIMARY KEY,
    plant_name VARCHAR(256) NOT NULL UNIQUE,
    plant_type VARCHAR(20)
        CHECK (plant_type IN ('Fruit', 'Vegetable', 'Other'))
);



CREATE TABLE growing_space_plants(
    spaceID INTEGER NOT NULL,
    plantID INTEGER NOT NULL,
    PRIMARY KEY (spaceID, plantID),
    FOREIGN KEY (spaceID) REFERENCES growing_spaces(spaceID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (plantID) REFERENCES plant_types(plantID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    amount_planted INTEGER NOT NULL CHECK (amount_planted > 0)
);

    
CREATE TABLE bulletin_board(
    postID SERIAL PRIMARY KEY,
    userID INTEGER NOT NULL,
    FOREIGN KEY (userID) REFERENCES account(userID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Help', 'Event', 'Supplies')),
    address VARCHAR(512) NOT NULL,
    time TIMESTAMP NOT NULL,
    content VARCHAR(512) NOT NULL
);



--TRIGGER FOR MAKING PROFILE ENTRY WHEN ACCOUNT IS CREATED
CREATE OR REPLACE FUNCTION create_profile_for_account()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (userID) VALUES (NEW.userID);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_profile
AFTER INSERT ON account
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_account();



--FUNCTION TO ADD A PLANT TO A GROWING SPACE, CHECKING IF THE PLANT TYPE EXISTS FIRST
--IF IT DOES NOT EXIST, IT WILL BE ADDED TO THE plant_types TABLE
CREATE OR REPLACE FUNCTION add_plant_to_growing_space(
    p_spaceID INTEGER,
    p_plant_name VARCHAR(256),
    p_plant_type VARCHAR(20),
    p_amount_planted INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_plantID INTEGER;
BEGIN
    INSERT INTO plant_types (plant_name, plant_type)
    VALUES (p_plant_name, p_plant_type)
    ON CONFLICT (plant_name) DO NOTHING;

    SELECT plantID
    INTO v_plantID
    FROM plant_types
    WHERE plant_name = p_plant_name;

    INSERT INTO growing_space_plants (spaceID, plantID, amount_planted)
    VALUES (p_spaceID, v_plantID, p_amount_planted);
END;
$$ LANGUAGE plpgsql;