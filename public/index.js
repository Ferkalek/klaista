const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const port = process.env.PORT || 3000;

const app = express();
app.use(cors({ origin: "*" }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/getKey", (req, res) => {
  const key = uuidv4();
  res.json({ key });
});

io.on("connection", (socket) => {
  const key = socket.handshake.query.key;
  const listId = socket.handshake.query.listId;
  console.log("User connected > id", key || listId);

  const idRoom = key || listId;

  if (idRoom) {
    const roomName = `room-${idRoom}`;

    if (key || io.sockets.adapter.rooms.has(`room-${listId}`)) {
      socket.join(roomName);

      socket.to(roomName).emit("userConnected");

      console.log("ROOMS", io.sockets.adapter.rooms);

      socket.on("sentListToPartner", (list) => {
        socket.to(roomName).emit("listFromOwner", list);
      });

      socket.on("disconnecting", (reason) => {
        console.log(`User id: ${socket.id} disconnected`, reason);

        if (io.sockets.adapter.rooms.get(roomName)?.size === 2) {
          socket.to(roomName).emit("onlyOwnerInRoom");
        }
      });
    } else {
      socket.disconnect(true);
    }
  } else {
    socket.disconnect(true);
  }
});

server.listen(port, () => console.log(`Listening on port ${port}`));
