import express from "express";
import { createServer } from "http";
import path from "path";
import { v4 } from "uuid";
import { Server } from "socket.io";

const main = async () => {
  const app = express();

  const server = createServer(app);

  const io = new Server(server);

  app.set("views", path.join(__dirname, "/views"));
  app.set("view engine", "ejs");

  app.use(express.static(path.join(__dirname, "public")));

  app.get("/", (_, res) => {
    res.redirect(`/${v4()}`);
  });

  app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
  });

  io.on("connection", (socket) => {
    socket.on("join-room", () => {
      console.log("joined room");
    });
  });

  server.listen(3030);
};

main().catch((err) => console.error(err));
