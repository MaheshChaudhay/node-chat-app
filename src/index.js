const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const path = require("path");
const http = require("http");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);

const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  // console.log("new connection with client");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }
    socket.emit("message", generateMessage(`Welcome ${username}`, "admin"));
    socket.join(user.room);
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username} has joined the room`, "admin")
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });

  socket.on("send", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMessage(message, user.username));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left`, "admin")
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("share-location", (position, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        `https://google.com/maps?q=${position.latitude},${position.longitude}`,
        user.username
      )
    );
    callback();
  });
});

server.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
