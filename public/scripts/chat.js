const socket = io();

const formElements = document.getElementById("input-form");
const locationBtn = document.getElementById("location-btn");
const messageContainer = document.getElementById("message-container");
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  const newMessage = messageContainer.lastElementChild;
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = messageContainer.offsetHeight;
  const conatinerHeight = messageContainer.scrollHeight;

  const scrollOffset = messageContainer.scrollTop + visibleHeight;

  if (conatinerHeight - newMessageHeight <= scrollOffset) {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
};

socket.on("message", (message) => {
  //console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    name: message.name,
    timestamp: moment(message.createdAt).format("h:mm A"),
  });
  messageContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (location) => {
  console.log(location);
  const html = Mustache.render(locationTemplate, {
    url: location.url,
    timestamp: moment(location.createdAt).format("h:mm A"),
    name: location.name,
  });
  messageContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

const inputElement = formElements[0];

const btn = formElements[1];

btn.addEventListener("click", (e) => {
  e.preventDefault();
  btn.setAttribute("disabled", "disabled");
  const message = inputElement.value.trim();
  if (message.length === 0) {
    btn.removeAttribute("disabled");
    inputElement.value = "";
    inputElement.focus();
    return;
  }
  socket.emit("send", message, (error) => {
    btn.removeAttribute("disabled");
    inputElement.value = "";
    inputElement.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message Delivered!");
  });
});

locationBtn.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by browser.");
  }
  locationBtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((pos) => {
    const position = {
      longitude: pos.coords.longitude,
      latitude: pos.coords.latitude,
    };
    socket.emit("share-location", position, () => {
      locationBtn.removeAttribute("disabled");
      console.log("Location shared!");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", (roomData) => {
  console.log(roomData.room);
  console.log(roomData.users);
  const html = Mustache.render(sidebarTemplate, {
    room: roomData.room,
    users: roomData.users,
  });
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = html;
});
