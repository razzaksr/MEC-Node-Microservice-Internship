// backend server: port, ip(localhost)
// import
const express = require('express')

// object for express
const app = express()
app.listen(9090,async()=>{
    console.log("My express js server running @ 9090!!!")
})