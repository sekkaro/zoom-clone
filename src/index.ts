import express from "express";
import { createServer } from "http";
import path from "path";
import { v4 } from "uuid";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";

const main = async () => {
  const app = express();

  const server = createServer(app);

  const peerServer = ExpressPeerServer(server);

  const io = new Server(server);

  app.set("views", path.join(__dirname, "/views"));
  app.set("view engine", "ejs");

  app.use(express.static(path.join(__dirname, "public")));
  app.use("/peerjs", peerServer);

  app.get("/", (_, res) => {
    res.redirect(`/${v4()}`);
  });

  app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
  });

  io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-connected", userId);

      socket.on("message", (msg) => {
        io.to(roomId).emit("createMessage", msg);
      });
    });
  });

  server.listen(process.env.PORT || 3030);
};

main().catch((err) => console.error(err));
