const winstone=require('winston');
module.exports=function (err,req,res,next) {
    winstone.error(err.message,err);
    // error
    // warn
    // info
    // verbose
    // debug
    // silly
    res.status(500).send('Something Faild');
}

//asklpu_profile_images