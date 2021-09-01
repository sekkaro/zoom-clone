import PeerType from "peerjs";
import { io } from "socket.io-client";
import jquery from "jquery";
import { __prod__ } from "../constants";

declare var Peer: any;
declare var ROOM_ID: string;
declare var $: typeof jquery;

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

const connectToNewUser = (
  userId: string,
  peer: PeerType,
  stream: MediaStream,
  videoGrid: HTMLElement | null
) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, videoGrid);
  });
};

const scrollToBottom = () => {
  let d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const setMuteButton = () => {
  const html = `<i class="mute fas fa-microphone-slash"></i>
<span>Mute</span>`;
  $("#mute").html(html);
};

const setUnmuteButton = () => {
  const html = `<i class="fas fa-microphone"></i>
<span>Mute</span>`;
  $("#mute").html(html);
};

const toggleMute = (stream: MediaStream) => {
  const enabled = stream.getAudioTracks()[0].enabled;
  if (enabled) {
    stream.getAudioTracks()[0].enabled = false;
    setMuteButton();
  } else {
    stream.getAudioTracks()[0].enabled = true;
    setUnmuteButton();
  }
};

const setStopVideo = () => {
  const html = `<i class="stop fas fa-video-slash"></i>
<span>Play Video</span>`;
  $("#video").html(html);
};

const setPlayVideo = () => {
  const html = `<i class="fas fa-video"></i>
  <span>Stop Video</span>`;
  $("#video").html(html);
};

const toggleVideo = (stream: MediaStream) => {
  const enabled = stream.getVideoTracks()[0].enabled;
  if (enabled) {
    stream.getVideoTracks()[0].enabled = false;
    setStopVideo();
  } else {
    stream.getVideoTracks()[0].enabled = true;
    setPlayVideo();
  }
};

const main = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const videoGrid = document.getElementById("video-grid");
  const myVideo = document.createElement("video");
  myVideo.muted = true;

  const peer: PeerType = new Peer(
    undefined,
    __prod__
      ? {
          host: "peerjs-server.herokuapp.com",
          secure: true,
          port: 443,
        }
      : {
          path: "/peerjs",
          host: "/",
          port: 3030,
        }
  );

  addVideoStream(myVideo, stream, videoGrid);

  peer.on("call", (call) => {
    call.answer(stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream, videoGrid);
    });
  });

  const socket = io("/");
  peer.on("open", (id: any) => {
    socket.emit("join-room", ROOM_ID, id);
  });

  socket.on("user-connected", (userId: string) => {
    connectToNewUser(userId, peer, stream, videoGrid);
  });

  let text = $("input");

  $("html").keydown((e) => {
    if (e.which == 13 && (text?.val() as string).length !== 0) {
      socket.emit("message", text.val());
      text.val("");
    }
  });

  socket.on("createMessage", (msg) => {
    $("ul").append(`<li class="message"><b>user</b><br/>${msg}</li>`);
    scrollToBottom();
  });

  $("#mute").on("click", () => {
    toggleMute(stream);
  });

  $("#video").on("click", () => {
    toggleVideo(stream);
  });
};

main().catch((err) => console.log("error from room: ", err));
