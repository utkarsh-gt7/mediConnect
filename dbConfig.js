import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

db.connect();

// SQL command to create the "comments" table
const createTestimonialsTableQuery = `
    CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        brief TEXT,
        date TEXT,
        rating INTEGER,
        content TEXT
    )
`;

const createUpComingSeminarsTableQuery = `
    CREATE TABLE IF NOT EXISTS upComingSeminars (
        id SERIAL PRIMARY KEY,
        joinLink TEXT,
        date TEXT,
        guestName TEXT,
        guestDescription TEXT,
        guest_Img_Url TEXT
    )
`;

// SQL command to create the "blogposts" table
const createUpcomingAppointmentsTableQuery = `
    CREATE TABLE IF NOT EXISTS upcomingAppointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        counsellor_id INTEGER,
        time_slot TEXT
    )
`;

// SQL command to create the "users" table
const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        password TEXT,
        image_url TEXT,
        role TEXT
    )
`;

// Execute the SQL commands to create the tables
db.query(createTestimonialsTableQuery, (err, res) => {
    if (err) {
        console.error("Error creating 'testimonials' table", err);
    } else {
        console.log("Table 'testimonials' created successfully");
    }
});

db.query(createUpComingSeminarsTableQuery, (err, res) => {
    if (err) {
        console.error("Error creating 'seminars' table", err);
    } else {
        console.log("Table 'seminars' created successfully");
    }
});

db.query(createUpcomingAppointmentsTableQuery, (err, res) => {
    if (err) {
        console.error("Error creating 'appointments' table", err);
    } else {
        console.log("Table 'appointments' created successfully");
    }
});

db.query(createUsersTableQuery, (err, res) => {
    if (err) {
        console.error("Error creating 'users' table", err);
    } else {
        console.log("Table 'users' created successfully");
    }
});

export default db;
