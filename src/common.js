import axios from "axios";
import moment from "moment";
import { API_KEY } from "./constants";
export function getRandomInt(max) { return Math.floor(Math.random() * max); }
export function isToday(someDate) {
  const today = new Date()
  someDate = new Date(someDate);
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
}
export function ytSetVolume(value) {
  var youtubeEmbedWindow = document.getElementById("secretVideo").contentWindow;
  var data = { event: 'command', func: 'setVolume', args: [value] }
  var message = JSON.stringify(data);
  youtubeEmbedWindow.postMessage(message, '*');
}

export function handleLoad({ cookies, setVideoLoaded }) {
  if (cookies.volume && document.getElementById("secretVideo")) {
    ytSetVolume(cookies.volume);
  }
  if (cookies.states && document.getElementById("secretVideo")) {
    var youtubeEmbedWindow = document.getElementById("secretVideo").contentWindow;
    var data = { event: 'command', func: 'seekTo', args: [cookies.states.startTime, true] }
    var message = JSON.stringify(data);
    youtubeEmbedWindow.postMessage(message, '*');
    youtubeEmbedWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  }
  if (document.getElementById("secretVideo")) {
    setVideoLoaded(true);
  }
}
export async function getRandomVideo(videos, { setVideo, setTitles }) {
  var randomVideo = videos[getRandomInt(videos.length)];
  var time;
  var response = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&id=${randomVideo.videoId}&key=${API_KEY}`);
  var timeString = response.data.items[0].contentDetails.duration;
  time = moment.duration(timeString, moment.ISO_8601).asSeconds();
  setVideo({ title: randomVideo.title, maxTime: time, videoId: randomVideo.videoId });
  setTitles(videos.map(video => video.title))
}

export function removeVideo(video, videos, {setVideos}) {
  var idx = -1;
  for (var i = 0; i < videos.length; i++) {
      if (videos[i].title === video.title) {
          idx = i;
          break;
      }
  }
  if (idx > -1) {
      videos.splice(idx, 1);
      setVideos(videos);
  }
}