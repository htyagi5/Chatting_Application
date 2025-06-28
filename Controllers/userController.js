
const prisma=require('../prisma/index');

const cookie=require('../authcookie/cookie');

exports.signup=async(req,res,next)=>{
    try{
        const {name,email,password}=req.body;
        if(!name || !email || !password){
            throw new Error("Please provide all the fields");
        }
        const user=await prisma.user.create({
          data:{  name,
            email,
            password,
          },
        })
        cookie(user,res);
        console.log(name);
       res.redirect(`/Advance.html?name=${encodeURIComponent(name)}`); // Redirect to the home page after signup
    } catch(error){
         throw new Error(error);
    }
    }