import { io } from "socket.io-client";
declare var Peer: any;
declare var ROOM_ID: string;

const addVideoStream = (
  video: HTMLVideoElement,
  stream: MediaStream,
  videoGrid: HTMLElement | null
) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid?.append(video);
};

const connectToNewUser = (userId: any) => {
  console.log(userId);
};

const main = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const videoGrid = document.getElementById("video-grid");
  const myVideo = document.createElement("video");
  myVideo.muted = true;

  const peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: 3030,
  });

  addVideoStream(myVideo, stream, videoGrid);

  const socket = io("/");
  peer.on("open", (id: any) => {
    socket.emit("join-room", ROOM_ID, id);
  });

  socket.on("user-connected", connectToNewUser);
};

main().catch((err) => console.log("error from room: ", err));
