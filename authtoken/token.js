const jwt = require('jsonwebtoken'); // ✅ REQUIRED


const getToken = (user) => {
  console.log("Generating token for user:", user.id, user.name);
  return jwt.sign(
    {
      userid: user.id,
      name: user.name   // ✅ include name
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

//use for Authorization 
const verifyToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {getToken,
                 verifyToken};