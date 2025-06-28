const prisma = require('../prisma/index');
const bcrypt = require('bcrypt');//Your user’s password in the database is in plain text ('567'), but you're trying to compare it using bcrypt.compare(), which only works if the stored password is hashed.
const  cookie  = require('../authcookie/cookie');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email,password);
    if (!email || !password) throw new Error("All fields are required");

    const user = await prisma.user.findUnique({ where: { email } });
    console.log("User found:", user);
    if (!user) return res.status(401).send("Invalid credentials");

   if (password !== user.password) {
  return res.status(401).send("Invalid credentials");
}


    cookie(user, res);
    console.log("Login successful for user:", user.name);
    res.redirect(`/Advance.html?name=${encodeURIComponent(user.name)}`);
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).send("Something went wrong");
  }
};




// const prisma=require('../prisma/index');

// const cookie=require('../authcookie/cookie');

// exports.login=async(req,res,next)=>{
//     try{
//         const {email,password}=req.body;
//         if(!email || !password){
//             throw new Error("Please provide all the fields");
//         }

//         cookie.verify(user,res);
//        res.redirect(`/Advance.html?name=${encodeURIComponent(name)}`); // Redirect to the home page after signup
//     } catch(error){
//          throw new Error(error);
//     }
//     }