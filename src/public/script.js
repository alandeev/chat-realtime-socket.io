const socket = io('/');

socket.emit('join-room', room_id, username);

socket.on('user-join', user => {
  console.log({action: "Conected", user});
})

socket.on('user-exit', user => {
  console.log({action: "disconnect", user});
})

socket.on('message', renderMessage)

function renderMessage(message){
  const { username, content } = message;
  console.log({username, content});
  const div = document.createElement("div")
  div.id = "message";

  const p = document.createElement("p");
  p.textContent = `${username}: ${content}`;

  div.appendChild(p);

  document.getElementById("container").appendChild(div);
}

function enviarMessagem(content){
  if(!content) return;

  renderMessage({ username, content });
  socket.emit('sendMessage', username, content);
}