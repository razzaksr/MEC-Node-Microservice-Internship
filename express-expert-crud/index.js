const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const schema = require('./expertSchema')
const model = mongoose.model('expert',schema)
const Consul = require('consul')
const axios = require('axios')
const jwt = require('jsonwebtoken')
require('dotenv').config()

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


// token verification
let token = ''
const authenticateToken=(req,res,next)=>{
    const receivedHeader = req.headers['authorization']
    if(!receivedHeader){
        return res.json({message:"No header has provided"})
    }
    // fetch the token alone from header using split by space delimiter
    token = receivedHeader.split(' ')[1]
    jwt.verify(token,process.env.secret,(err,decoded)=>{
        if(err){
            return res.json({message:"Unauthorized Access/ Invalid Token"})
        }
        req.user = decoded
        next()
    })
}

// forward Token
const authForward = (req,res,next)=>{
    const header = req.headers['authorization']
    if(header){
        req.headers['authorization']=header
        // create an new header with same value for forwarding to the service
    }
    next()// forwarding invoked
}

// MongoDB connection
mongoose.connect('mongodb+srv://razak:mohamed@cluster0.ptmlylq.mongodb.net/mecmicroservice?retryWrites=true&w=majority&appName=Cluster0');

// CRUD
app.post('/',authenticateToken,async(req,res)=>{
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

// read all experts with their courses
app.get('/',authenticateToken,async(req,res)=>{
    var experts = await model.find()
    const services = await consul.catalog.service.nodes('course-service')
    if(services.length==0)
        throw new Error("Course service not registered in consul")
    const coursServ = services[0]
    const updatedExperts = await Promise.all(
        experts.map(async(each)=>{
            let expertCourses = []
            try{
                // calling course endpoint with building header
                const received = await axios.get(`http://${coursServ.Address}:${coursServ.ServicePort}/trainer/${each.expertId}`,{
                    headers:{
                        'authorization':`Bearer ${token}`
                    }
                })
                expertCourses = received.data
            }
            catch(error){return res.json({message:"Error fetching courses"})}
            // building new response json for each expert
            return {"expert":each,"courses":expertCourses}
        })
    )
    res.json(updatedExperts)
})

// read by uniqe field
app.get('/:unique',authenticateToken,async(req,res)=>{
    const fetched = await model.findById(id=req.params.unique)
    res.json(fetched)
})

// read by other fields
app.get('/experience/:exp',authenticateToken,async(req,res)=>{
    const list = await model.find({expertExperience:req.params.exp})
    res.json(list)
})

// update
app.put('/',authenticateToken,async(req,res)=>{
    const result = await model.updateOne({_id:req.body._id},req.body,{upsert:true})
    res.json(result)
})

// delete
app.delete('/:id',authenticateToken,async(req,res)=>{
    await model.findOneAndDelete(id=req.params.id)
    res.json("Deleted")
})

app.listen(6060,async()=>{
    console.log('expert endpoints are ready!!!!!!!!!!')
})