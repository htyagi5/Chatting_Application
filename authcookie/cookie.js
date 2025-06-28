const {getToken} = require('../authtoken/token');

const  cookie=(user,res)=>{
    const token=getToken(user);
    const options={
        expires:new Date(Date.now()+3*24*60*60*1000),
        httpOnly:true,
    }
    user.password=undefined;
    res.status(200).cookie('token',token,options)
    // .json({
    //     success:true,
    //     user,
    //     token
    // })
}
module.exports=cookie;