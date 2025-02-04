const express = require('express')
const Consul = require('consul')
const {createProxyMiddleware} = require('http-proxy-middleware')

const app = express()
const consul = new Consul()

// function to fetch the respective service details based on reference mentioned in url
const fetchingService=async(requestedService)=>{
    try{
        const services = await consul.catalog.service.nodes(requestedService)
        if(services.length==0)
            throw new Error("requested service not registered in consul")
        const foundService = services[0]
        return `http://${foundService.Address}:${foundService.ServicePort}`
    }
    catch(error){
        throw new Error(`Error fetching service details for requested`)
    }
}

// middleware to forwarding token to the respective service
const authForward = (req,res,next)=>{
    const header = req.header['authorization']
    if(header){
        req.headers['authorization']=header
        // create an new header with same value for forwarding to the service
    }
    next()// forwarding invoked
}

// middleware to call to identify if the user requested for expert service
app.use('/expert',authForward,async(req,res,next)=>{
    try{
        // fetching expert url, port using fetching function
    const expertDetails = await fetchingService('expert-service')
    // forwarding to expert service
    createProxyMiddleware({
        target:expertDetails,
        changeOrigin:true
    })(req,res,next)
    }
    catch(error){
        res.send({error:error.message})
    }
})
// middleware to call to identify if the user requested for course service
app.use('/course',authForward,async(req,res,next)=>{
    try{
        // fetching course url, port using fetching function
    const courseDetails = await fetchingService('course-service')
    // forwarding to course service
    createProxyMiddleware({
        target:courseDetails,
        changeOrigin:true
    })(req,res,next)
    }
    catch(error){
        res.send({error:error.message})
    }
})
// middleware to call to identify if the user requested for authentication service
app.use('/auth',async(req,res,next)=>{
    try{
        // fetching authentication url, port using fetching function
    const authenticationDetails = await fetchingService('authentication-service')
    // forwarding to authentication service
    createProxyMiddleware({
        target:authenticationDetails,
        changeOrigin:true
    })(req,res,next)
    }
    catch(error){
        res.send({error:error.message})
    }
})

app.listen(5050,()=>{
    console.log("Api gateway running 5050!!!!")
})