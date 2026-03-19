const mongoose = require("mongoose");
require('dotenv').config();
const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.DATABASE_URI);
        console.log("Database connected successfully ✅");
    } catch(error){
        console.error(error, "database connection failed !!");
        process.exit(1);
    }
}

module.exports = connectDB;