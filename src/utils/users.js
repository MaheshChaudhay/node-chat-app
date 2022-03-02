const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Username and room required!",
    };
  }

  const existingUser = users.find(
    (user) => user.username === username && user.room === room
  );

  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex >= 0) {
    return users.splice(userIndex, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  if (user) {
    return user;
  }
};

const getUsersInRoom = (room) => {
  const roomUsers = users.filter((user) => user.room === room);
  return roomUsers;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
