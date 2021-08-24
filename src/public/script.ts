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

const main = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const videoGrid = document.getElementById("video-grid");
  const myVideo = document.createElement("video");
  myVideo.muted = true;

  addVideoStream(myVideo, stream, videoGrid);
};

main().catch((err) => console.log("error from room: ", err));
