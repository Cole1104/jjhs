const express = require('express');
const fs = require('fs');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const ioS = new Server(server,{
  cors:{
    origin:"https://jjhs.vercel.app",
    
    credentials: true
  }
});
let userList = [];
let now = new Date();
let chatLog = [];
ioS.on('connection',(user)=>{
  
    user.join('matching...')
    userList.push(user.id);
    if(userList.length == 2){
      const madeRoomId = userList.join("");
      userList = [];
      ioS.in('matching...').socketsJoin(madeRoomId);
      ioS.in('matching...').socketsLeave('matching...');
      ioS.in(madeRoomId).emit('matched!',madeRoomId);
    }
    user.on('disconnect',()=>{
        userList.filter(element => element !==user.id);
    })
    user.on('message',(value,roomId,name)=>{
      
      if(roomId == undefined){
        console.log(roomId);
        return;
      }
      user.in(roomId).emit('messaged',value,name);
      chatLog.push(`${now}//${name}:${value}\n`);
      
      
    })
})
ioS.of("/").adapter.on("leave-room", (room, id) => {
  if(room.length == 40){
    console.log(room);
    ioS.in(room).emit('byebye')
    makeLog();
    chatLog = [];
  }
  
});
app.get('/', (req, res) => {
  res.send('Hello World!')
})

function makeLog(){
  const beforeLog = fs.readFileSync('./chat.log').toString('utf8');
  fs.writeFileSync('./chat.log',`${beforeLog}\n${chatLog.join('')}`);
  

}
server.listen(3001, () => {
  console.log(`Example app listening on port 3001`)
})