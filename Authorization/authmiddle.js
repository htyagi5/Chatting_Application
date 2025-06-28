const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { verifyToken } = require('../authtoken/token');

const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  const decoded = verifyToken(token);

  if (!decoded || !decoded.userid) {
    return res.redirect('/login');
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userid
      }
    });

    if (!user) {
      return res.redirect('/login');
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.redirect('/login');
  }
};

module.exports = requireAuth;
