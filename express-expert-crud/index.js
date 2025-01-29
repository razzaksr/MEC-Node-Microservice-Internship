const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const schema = require('./expertSchema')
const model = mongoose.model('expert',schema)
const Consul = require('consul')
const axios = require('axios')

const app = express()
const serviceKey = "expert-service"
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
const consul = new Consul()// object

// register expert service in consul discovery server
consul.agent.service.register({
    id:serviceKey,
    name:serviceKey,
    address:"localhost",
    port:6060
},
(err)=>{
    if(err)
        throw err;
    console.log('Expert Service successfully registered')
})
// deregister from consul discovery server whenever ctrl+c/ interruption happens
process.on("SIGINT",async()=>{
    consul.agent.service.deregister(serviceKey,()=>{
        if(err)
            throw err
        console.log("Expert service deregistered")
    })
})

// MongoDB connection
mongoose.connect('mongodb+srv://razak:mohamed@cluster0.ptmlylq.mongodb.net/mecmicroservice?retryWrites=true&w=majority&appName=Cluster0');

// CRUD
app.post('/',async(req,res)=>{
    const obj = new model({
        expertId:req.body.expertId,
        expertName:req.body.expertName,
        expertExperience:req.body.expertExperience,
        expertContact:req.body.expertContact,
        expertDesignation:req.body.expertDesignation
    })
    const result = await obj.save()
    res.json(result)
})

// read all experts
app.get('/',async(req,res)=>{
    var experts = await model.find()
    const services = await consul.catalog.service.nodes('course-service')
    if(services.length==0)
        throw new Error("Course service not registered in consul")
    const coursServ = services[0]
    const updatedExperts = await Promise.all(
        experts.map(async(each)=>{
            let expertCourses = []
            try{
                const received = await axios.get(`http://${coursServ.Address}:${coursServ.ServicePort}/trainer/${each.expertId}`)
                expertCourses = received.data
            }
            catch(error){return res.json({message:"Error fetching courses"})}
            return {"expert":each,"courses":expertCourses}
        })
    )
    res.json(updatedExperts)
})

// read by uniqe field
app.get('/:unique',async(req,res)=>{
    const fetched = await model.findById(id=req.params.unique)
    res.json(fetched)
})

// read by other fields
app.get('/experience/:exp',async(req,res)=>{
    const list = await model.find({expertExperience:req.params.exp})
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

app.listen(6060,async()=>{
    console.log('expert endpoints are ready!!!!!!!!!!')
})