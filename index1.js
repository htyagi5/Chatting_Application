const http=require('http');
const express=require('express');
const path=require('path');
const {Server}=require('socket.io');

const app=express();
const server=http.createServer(app);
const io=new Server(server);



//it supports socket.io
io.on('connection',(socket)=>{
    socket.on('user-message',(msg)=>{
        // console.log('a new user message',msg);
        //FOR MESSAGEE TO BE DISPLAYED TO ALL USERS
        io.emit('message',{id:socket.id,text:msg});
    })
})


//it supports http requests
app.use(express.json());
app.use(express.static(path.resolve('./public')));
 
app.get('/',(req,res)=>{
    // res.sendFile('./public/index.html');
res.sendFile(path.resolve('./public/Advance.html'))
});
server.listen(3000,()=>{
    console.log('Server is running on port 3000');
});