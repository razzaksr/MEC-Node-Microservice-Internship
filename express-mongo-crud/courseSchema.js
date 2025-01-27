const mongoose = require('mongoose')
// collection:
const courseSchema = new mongoose.Schema({
    courseId:{
        type:String
    },
    courseName:{
        type:String
    },
    courseHours:{
        type:Number
    },
    courseFee:{
        type:Number
    },
    courseExpert:{
        type:String
    }
});

module.exports=courseSchema;