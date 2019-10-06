const mongoose=require('mongoose');
module.exports=function () {
    mongoose.connect("mongodb://localhost/asklpu",{
        useNewUrlParser:true,
        useFindAndModify:false,
        useCreateIndex:true,
        useUnifiedTopology: true
    })
        .then(()=>console.log('Connected to mongodb'))
        .catch(err=>console.log('Could not connect to mongoDB...',err));

}