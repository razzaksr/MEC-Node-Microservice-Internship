require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Consul = require("consul");

const app = express();
app.use(express.json());
const consul = new Consul()

// static user detils>> it can be implemented with mongodb later
const users = [
    { id: 1, username: "razak", password: bcrypt.hashSync("mohamed@123", 8) },
    { id: 2, username: "rasheedha", password: bcrypt.hashSync("mohamed@123", 8) },
];

// register service in consul
const serviceId = "authentication-service";
consul.agent.service.register(
  {
    id: serviceId,
    name: serviceId,
    address: "localhost",
    port: 4040,
  },
  (err) => {
    if (err) throw err;
    console.log("Authentication service registered with Consul");
  }
);
// Deregister the service on exit
process.on("SIGINT", () => {
consul.agent.service.deregister(serviceId, (err) => {
        if (err) throw err;
        console.log("Authentication service deregistered");
        process.exit();
    });
});


// endpoints

// login >> accept username, password and respond with token after generating using jsonwebtoken
/* 
POST http://localhost:5050/auth/login
Content-Type: application/json

{
    "username":"rasheedha",
    "password":"mohamed@123"
}
*/
app.post('/login',async(req,res)=>{
    // const user = req.body.username
    // const pass = req.body.password
    
    const{user,pass} = req.body

    // fetch the user details based on given username
    const matched = users.find((each)=>each.username == user);

    // if username was not found or given password repective to username is not same
    if(!matched || !bcrypt.compareSync(pass,matched.password)){
        return res.json({message:"Invalid Credentials"})
    }

    // token generation when above condition get fails
    const generatedToken = jwt.sign({username:matched.username}, process.env.secret, {
        expiresIn:"1h"
    })

    res.json({generatedToken})

})

// register endpont>> new user details creation

app.listen(4040, () => {
    console.log("Authentication service running on port 4040");
});