const express = require('express');
const cors = require('cors');
const { v4: uuidV4, validate } = require('uuid');

const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const rooms = []

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');

app.use('/', express.static(__dirname+'/public'));

app.get('/', (req, res) => {
  return res.render('home', { rooms });
})

app.get('/join', (req, res) => {
  return res.redirect(`/room/${uuidV4()}`);
})

app.get('/room/:room_id', (req, res) => {
  const { room_id } = req.params;
  
  if(!validate(room_id)) return res.json({ error: "NOT IS VALID ROOM_ID" })

  var existsRoom = rooms.find(room => room.room_id == room_id);
  if(!existsRoom){
    const newRoom = {
      room_id,
      users: []
    }

    rooms.push(newRoom);
  }
  return res.render('room', { room_id });
})

io.on('connection', socket => {
  const { id } = socket;

  socket.on('disconnect', () => {
    const roomIndex = rooms.findIndex(room => room.users.find(user => user.id == id));
    if(roomIndex == -1) return;

    const userIndex = rooms[roomIndex].users.findIndex(user => user.id == id);
    if(userIndex == -1) return;

    const user = rooms[roomIndex].users[userIndex];

    rooms[roomIndex].users.splice(userIndex, 1);

    socket.to(rooms[roomIndex].room_id).broadcast.emit('user-exit', user);

    if(rooms[roomIndex].users.length == 0)
      rooms.splice(roomIndex, 1);
    
    return;
  });


  socket.on('join-room', (room_id, username) => {
    const roomIndex = rooms.findIndex(room => room.room_id == room_id);
    if(roomIndex == -1)
      return;

    const newUser = { username, id };

    rooms[roomIndex].users.push(newUser)
    socket.join(room_id);
    socket.to(room_id).broadcast.emit('user-join', newUser);
  })
  
  socket.on('sendMessage', (username, content) => {
    console.log(rooms);
    if(!content) return;

    const room = rooms.find(room => room.users.find(user => user.id == id));
    if(!room) return;

    const newMessage = {
      id,
      username, 
      content
    };

    socket.to(room.room_id).broadcast.emit('message', newMessage);
  })
})

server.listen(3333, () => {
  console.log("SERVER ON");
})


