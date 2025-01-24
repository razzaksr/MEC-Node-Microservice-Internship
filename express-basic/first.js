// backend server: port, ip(localhost)
// import
const express = require('express')
const bodyParser = require('body-parser')

// receive requests from user and process(authentication,
//  performing specific login, data base operation) it, responding

// json based request, json based response

// endpoints: functions with URL's, it can be called by client with url
// mapping>> get(), post, put, delete



// object for express
const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

// endpoints:
// obj.mapping(url, async.action_funtion(request, response)=>{})
// localhost:9090/
app.get('/',async(req, res)=>{
    res.send("<h1>Welcome to Microservice internship</h1>")
})

app.get('/passing/:alpha',async(req,res)=>{
    res.send(`Logged person ${req.params.alpha}`)
})


app.get('/bmi/:weight/:height',async(req,res)=>{
    // const weight = req.params.weight
    // const height = req.params.height
    let{weight,height}=req.params    // weight, height
    height/=100// cm to m
    const bmi = weight/(height*height)
    res.send(`Your Body Mass Index is ${bmi}`)
})

app.post('/sub',async(req,res)=>{
    let {weight,height} = req.body
    height/=100// cm to m
    const bmi = weight/(height*height)
    // res.send(`Your Body Mass Index is ${bmi}`)
    res.json(
        {
            "weight":weight,
            "height":height,
            "bmi":bmi
        }
    )
})

app.listen(9090,async()=>{
    console.log("My express js server running @ 9090!!!")
})