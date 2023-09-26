import logo from './logo.svg';
import './App.css';
import Attempts from './components/attempt';
import Title from './components/title';
import GameBar from './components/gameBar';
import PlayButton from './components/playButton';
import { VolumeDown, VolumeUp } from './components/svg';
import Autocomplete from './components/autocomplete';
import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment/moment';

function App() {
  const CURRENT = '#afcbdd';
  const PAST = '#000000';
  const FUTURE = '#505050';
  const [attemptDetails, setAttemptDetails] = useState(
    [
      { focus: true, value: "", color: "#ffffff" },
      { focus: false, value: "", color: "#ffffff" },
      { focus: false, value: "", color: "#ffffff" },
      { focus: false, value: "", color: "#ffffff" },
      { focus: false, value: "", color: "#ffffff" },
      { focus: false, value: "", color: "#ffffff" },
    ]
  )
  const [input, setInput] = useState('');
  const [count, setCount] = useState(0);
  const [skip, setSkip] = useState(1);
  const [volume, setVolume] = useState(100);
  const [duration] = useState([1, 2, 4, 7, 11, 16]);
  const [songBar, setSongBar] = useState({duration: duration[count],width: 0,})
  const [sectionColors, setSectionColors] = useState(
    [CURRENT, FUTURE, FUTURE, FUTURE, FUTURE, FUTURE]
  )
  const [startTime, setStartTime] = useState(0);
  const [sliderDisabled, setSliderDisabled] = useState(false);
  const [items, setItems] = useState([]);
  const [video, setVideo] = useState({ videoId: '', maxTime: 0, title: 'dummyTitle' });
  const API_KEY = '';

  const answer = "chaewon";
  function moveBar() {
    sectionColors[count] = PAST;
    sectionColors[count+1] = CURRENT;
    attemptDetails[count].focus = false;
    attemptDetails[count+1].focus = true;
    setSectionColors(sectionColors);
    setCount(count+1);
  }
  function handleSkip() {
    setSkip(skip + 1);
    attemptDetails[count].skipped = true;
    setAttemptDetails(attemptDetails);
    moveBar();
  }
  
  function getRandomInt(max) { return Math.floor(Math.random() * max); }
  function handleSliderRelease(value) {
    var youtubeEmbedWindow = document.getElementById("secretVideo").contentWindow;
    var data = { event: 'command', func: 'seekTo', args: [value, true] }
    var message = JSON.stringify(data);
    youtubeEmbedWindow.postMessage(message, '*');
    youtubeEmbedWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  }
  function handleGuess() {
    attemptDetails[count].value = input;
    moveBar();
    setInput('');
    if (input === answer) {
      alert("the answer is chaewon!");
    }
  }
  useEffect(() => { gameStart(); }, [])
  const gameStart = async () => {
      var pageInfo;
      var nextPageToken = '';
      var playlist = await axios.get(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=PLOHoVaTp8R7dfrJW5pumS0iD_dhlXKv17&key=${API_KEY}`);
      pageInfo = playlist.data.pageInfo;
      var data = items;
      data = data.concat(playlist.data.items);
      nextPageToken = playlist.data.nextPageToken;
      for (let i = 1; i < Math.ceil(pageInfo.totalResults / pageInfo.resultsPerPage); i++) {
        var nextPage = await axios.get(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${nextPageToken}&playlistId=PLOHoVaTp8R7dfrJW5pumS0iD_dhlXKv17&key=${API_KEY}`);
        data = data.concat(nextPage.data.items);
        nextPageToken = nextPage.data.nextPageToken;
      }
      setItems(data);
      getRandomVideo(data);
  }
  async function getRandomVideo(data) {
    var randomVideoId = data[getRandomInt(data.length)].snippet.resourceId.videoId;
    var time;
    var response = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&id=${randomVideoId}&key=${API_KEY}`);
    var title = response.data.items[0].snippet.title;
    var timeString = response.data.items[0].contentDetails.duration;
    time = moment.duration(timeString, moment.ISO_8601).asSeconds();
    console.log(time)
    setVideo({ title: title, maxTime: time, videoId: randomVideoId });
  }
  return (
    <div className="App" class="h-screen bg-[#1a2633]">
      <div class="text-center min-h-[10%]" >
        <Title />
      </div>
      <div className="Body" class="flex flex-col items-center space-y-4 min-h-[70%]">
      <Attempts attemptDetails={attemptDetails} />
        <iframe id="secretVideo" width="560" height="315" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen></iframe>
      </div>
      <div className="Game" class="flex flex-col items-center space-y-2">
        <GameBar duration={duration[count]} songBar={songBar} sectionColors={sectionColors}/>
        <div class="w-2/6 flex flex-row">
          <input type="range" class="w-full" min="0" max={video.maxTime} value={startTime}
            onMouseUp={(e) => { handleSliderRelease(e.target.value) }}
            onInput={(e) => { setStartTime(e.target.value) }}
            disabled={sliderDisabled}
          />
          <p class="text-white">{Math.floor(startTime / 60)}:{startTime % 60 < 10 ? '0' + (startTime % 60) : startTime % 60}</p>
        </div>
        <PlayButton
                  duration={duration[count]}
                  setSliderDisabled={setSliderDisabled}
                  setSongBar={setSongBar}
                  startTime={startTime}
                />
        <div class="w-2/6 flex flex-row">
                <VolumeDown />
                <input type="range" class="w-full" min="0" max="100"
                  value={volume}
                  onInput={(e) => { setVolume(e.target.value) }}
                />
                <VolumeUp />
              </div>
              <Autocomplete
                userInput={input}
                setUserInput={setInput}
                suggestions={[
                  "Alligator",
                  "Bask",
                  "Crocodilian",
                  "Death Roll",
                  "Eggs",
                  "Jaws",
                  "Reptile",
                  "Solitary",
                  "Tail",
                  "Wetlands"
                ]}
              />
        <div class="w-3/6 flex justify-between">
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded " onClick={handleSkip}>
            Skip ({skip}s)
          </button>
          <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={false} onClick={handleGuess} >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
