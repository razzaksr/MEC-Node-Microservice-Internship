const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const schema = require('./courseSchema')
const model = mongoose.model('course',schema)
const Consul = require('consul')

const app = express()
const serviceKey = "course-service"
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
const consul = new Consul()

// register course service in consul discovery server
consul.agent.service.register({
    id:serviceKey,
    name:serviceKey,
    address:"localhost",
    port:9090
},
(err)=>{
    if(err)
        throw err;
    console.log('Course Service successfully registered')
})
// deregister from consul discovery server whenever ctrl+c/ interruption happens
process.on("SIGINT",async()=>{
    consul.agent.service.deregister(serviceKey,()=>{
        if(err)
            throw err
        console.log("Course service deregistered")
    })
})

// MongoDB connection
mongoose.connect('mongodb+srv://razak:mohamed@cluster0.ptmlylq.mongodb.net/mecmicroservice?retryWrites=true&w=majority&appName=Cluster0');

// CRUD
// create
app.post('/',async(req,res)=>{
    // destructure
    const obj = new model({
        courseId:req.body.courseId,
        courseName:req.body.courseName,
        courseHours:req.body.courseHours,
        courseFee:req.body.courseFee,
        courseExpert:req.body.courseExpert
    })

    const received = await obj.save()
    res.json(received)
})

// read
app.get('/',async(req,res)=>{
    const courses = await model.find()
    res.json(courses)
})

// read by uniqe field
app.get('/:unique',async(req,res)=>{
    const fetched = await model.findById(id=req.params.unique)
    res.json(fetched)
})

// read by other fields
app.get('/trainer/:id',async(req,res)=>{
    // const list = await model.findOne({courseExpert:req.params.name})
    const list = await model.find({courseExpert:req.params.id})
    res.json(list)
})

// update
app.put('/',async(req,res)=>{
    const result = await model.updateOne({_id:req.body._id},req.body,{upsert:true})
    res.json(result)
})

// delete
app.delete('/:id',async(req,res)=>{
    await model.findOneAndDelete(id=req.params.id)
    res.json("Deleted")
})

app.listen(9090,async()=>{
    console.log("My express js server running @ 9090!!!")
})