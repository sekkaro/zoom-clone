import express from "express";
import path from "path";
import { v4 } from "uuid";

const main = () => {
  const app = express();

  app.set("views", path.join(__dirname, "/views"));
  app.set("view engine", "ejs");

  app.use(express.static(path.join(__dirname, "public")));

  app.get("/", (_, res) => {
    res.redirect(`/${v4()}`);
  });

  app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
  });

  app.listen(3030);
};

main();
