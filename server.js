const express = require("express");
require('dotenv').config();
const connectDB = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const interviewRoutes = require("./routes/interviewRoutes");
connectDB();
const app = express();
app.use(cors());


//middleware to read json
app.use(express.json());

app.use("/api/interview",interviewRoutes);

//get route
app.get('/', (req,res)=>{
    res.send("Server is running");
})





//post route data for register
app.post('/register',async (req,res)=>{
    try{
        const {name,password,email} = req.body;
        hashedpassword = await bcrypt.hash(password,10);
        const user = new User({
            name,
            password : hashedpassword,
            email
        });
        const savedUser = await user.save();

        res.status(201).json(
            {
                message: "User created successfully ✅",
                user: savedUser
            }
        )
    } catch(error){
        res.status(500).json({
            message: " User not created !!"
        })
    }
})



//post route for login user

app.post('/login',async(req,res)=>{
    try{
        const {email,password} = req.body;
        
        //find user
        const user = await User.findOne({email});

        if(!user) {
            return res.status(404).json({message: "Error: User not Exist !!"});
        }
        //if user found then match [password]
        const ismatch = await bcrypt.compare(password,user.password);
        if(!ismatch){
            return res.status(401).json({message: "Invalid Password!!"});
        }
        const token = jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        );
        res.status(200).json({
            message: "successfully login",
            token,
            user:{
                id: user._id,
                name: user.name
            }
        })
        

    }catch(error){
        res.status(500).json({
            message: "Server Error!!"
        })
    }
})

//post route
app.post('/test', (req,res)=>{
    console.log(req.body);

    res.json({
        message: "data recieved successfully ✅",
        yourdata: req.body
    });
})

//port
app.listen(5000, ()=>{
    console.log("Server is running on port: 5000");
})