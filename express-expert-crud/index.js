const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const schema = require('./expertSchema')
const model = mongoose.model('expert',schema)

const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

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

// read
app.get('/',async(req,res)=>{
    const experts = await model.find()
    res.json(experts)
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