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
export function ytSetVolume(volume) {
  var youtubeEmbedWindow = document.getElementById("secretVideo").contentWindow;
  var data = { event: 'command', func: 'setVolume', args: [volume] }
  var message = JSON.stringify(data);
  youtubeEmbedWindow.postMessage(message, '*');
}

export function ytSetStartTime(startTime) {
  var youtubeEmbedWindow = document.getElementById("secretVideo").contentWindow;
  var data = { event: 'command', func: 'seekTo', args: [startTime, true] }
  var message = JSON.stringify(data);
  youtubeEmbedWindow.postMessage(message, '*');
  youtubeEmbedWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
}

export function handleLoad({ cookies, setVideoLoaded }) {
  if (document.getElementById("secretVideo")) {
    if (cookies.volume) ytSetVolume(cookies.volume);
    var startTime = cookies.states ? cookies.states.startTime : 1;
    ytSetStartTime(startTime);
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

export function removeVideo(video, videos, { setVideos }) {
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

export function handleAsk(videoId, startTime, count, sectionColors, { setCopied }) {
  const colorHash = {
    "#38bdf8": "C",
    "#000000": "P",
    "#505050": "F"
  }
  var res = "Do you know this song?\n";
  var url = `https://ytheardle.netlify.app/help/${videoId}/${startTime}/${count}/`;
  for (let i = 0; i < sectionColors.length; i++) {
    url += colorHash[sectionColors[i]];
  }
  res += url;
  navigator.clipboard.writeText(res);
  setCopied(true);

}