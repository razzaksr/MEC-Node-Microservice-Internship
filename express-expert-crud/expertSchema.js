const mongoose = require('mongoose')

const expertSchema = new mongoose.Schema({
    expertId:{
        type:String
    },
    expertName:{
        type:String
    },
    expertExperience:{
        type:Number
    },
    expertContact:{
        type:Number
    },
    expertDesignation:{
        type:String
    },
});

module.exports=expertSchema;