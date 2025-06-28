const http=require('http');
const express=require('express');
const path=require('path');
const cookieParser = require('cookie-parser');
const multer=require('multer');
const {Server}=require('socket.io');
const Chat=require('./models/chat.js');

const app=express();
app.use(cookieParser());
const server=http.createServer(app);
const io=new Server(server);

//MongoDb connection
const mongoose=require('mongoose');
const { send } = require('process');
mongoose.connect('mongodb://localhost:27017/chatApp')
.then(()=>console.log('MongoDB connected'))

const { verifyToken } = require('./authtoken/token');

io.use((socket, next) => {
  const token = socket.handshake.headers.cookie?.split('; ')
    .find(c => c.startsWith('token='))
    ?.split('=')[1];

  if (!token) {
    return next(new Error("Unauthorized - No token"));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new Error("Unauthorized - Invalid token"));
  }

  socket.userId = decoded.userid;
  next();
});


//it supports socket.io
io.on('connection',async (socket)=>{
      console.log('User connected:', socket.id,'UserID:', socket.userId);
    const messages= await Chat.find({}).sort({createdAt:1}).lean(10);
    
   messages.forEach((msg) => {
  if (msg.type === 'text') {
    socket.emit('message', { id: msg.senderId, text: msg.text ,name: msg.name || 'Anonymous' });
  } else if (msg.type === 'file') {
    socket.emit('file', { id: msg.senderId, file: msg.text,name: msg.name || 'Anonymous' });
  }
});
 
    socket.on('user-message',async (msg)=>{
         const isSender = msg.senderId === socket.id;
           const message=new Chat({
            text:msg.text,
            senderId:socket.id,
            type:'text',
            name:msg.name || 'Anonymous', // Use msg.name if available, otherwise default to 'Anonymous'
            status:isSender?'sent':'received',
            sent:isSender,
        })
        await message.save();
        // console.log('a new user message',msg);
        //FOR MESSAGEE TO BE DISPLLAYED TO ALL USERS
        io.emit('message',{id:socket.id,text:msg.text,name:msg.name || 'Anonymous',status:isSender?'sent':'received'});
    })
})

//For uploading file 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null,"./uploads")
    },//cb refer callback function that contain error and destination and filename
    filename: function (req, file, cb) {
        return cb(null,`${Date.now()}-${file.originalname}`)//this file.originalname help to put file in its original format
    }
})
const upload=multer({storage});


//it supports http requests
app.use(express.json());
app.use(express.static(path.resolve('./public')));
app.use(express.urlencoded({extended:true}));
app.use('/uploads',express.static(path.resolve('./uploads')));
//auth
const {signup}=require('./Controllers/userController');
const { param } = require('../Prisma/routes/userRoutes.js');
const { login } = require('./Controllers/postController.js');
const requireAuth = require('./Authorization/authmiddle.js');
app.get('/signUp', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'SignUp.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

app.post('/signUp', async (req, res) => {
  try {
    await signup(req, res);
  } catch (err) {
    console.error("Signup failed:", err);
    res.status(500).send("Internal Server Error");
  }
});
app.post('/login', async (req, res) => {

  // You can implement real DB logic here
  try{
    await login(req, res);
    // res.send('Login successful!');
  } catch (err) {
    res.status(401).send('Invalid credentials');
  }
});



app.get('/',requireAuth,(req,res)=>{
    // res.sendFile('./public/index.html');
    const user=req.body
  console.log('req.user in / route:', req.user);
 res.sendFile(path.join(__dirname, 'public', 'Advance.html'), {
    headers: {
      'Content-Type': 'text/html',
      'Set-Cookie': `token=${req.cookies.token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict`
    }
  });
   
});

app.post('/',requireAuth,upload.single('profileImage'),async (req,res)=>{
    
 if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded!' });
  }

 const filePath = `/uploads/${req.file.filename}`;
const senderId = req.body.senderId || 'server'; // get sender from form

// Save to MongoDB
const fileMessage = new Chat({
  text: filePath,
  senderId,
  type: 'file',
  name: req.body.name || 'Anonymous', // Use req.body.name if available, otherwise default to 'Anonymous'
});
await fileMessage.save();

// Emit to all users
io.emit('file', { id: senderId, file: filePath, name: req.body.name || 'Anonymous' });

res.sendStatus(200); // Do NOT redirect to '/'
})

server.listen(3000,()=>{
    console.log('Server is running on port 3000');
});