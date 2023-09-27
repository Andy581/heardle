import './App.css';
import Attempts from './components/attempt';
import Title from './components/title';
import GameBar from './components/gameBar';
import { useState, useEffect } from 'react';
import PlayButton from './components/playButton';
import Countdown from './components/countdown'
import axios from 'axios';
import Autocomplete from './components/autocomplete';
import Results from './components/results';
import { Loading, VolumeDown, VolumeUp } from './components/svg';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import moment from 'moment/moment';

const firebaseConfig = {
  apiKey: `${process.env.REACT_APP_FIREBASE_API_KEY}`,
  authDomain: `${process.env.REACT_APP_AUTH_DOMAIN}`,
  projectId: `${process.env.REACT_APP_PROJECT_ID}`,
  storageBucket: `${process.env.REACT_APP_STORAGE_BUCKET}`,
  messagingSenderId: `${process.env.REACT_APP_MESSAGING_SENDER_ID}`,
  appId: `${process.env.REACT_APP_APP_ID}`,
  measurementId: `${process.env.REACT_APP_MEASUREMENT_ID}`
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Gonna move all this crap when we have different pages
function App() {
  const CURRENT = '#38bdf8';
  const PAST = '#000000';
  const FUTURE = '#505050';
  const SKIPPED = '#808080';
  const WRONG = '#ff0000';
  const CORRECT = '#008000'
  const [correct, setCorrect] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [sliderDisabled, setSliderDisabled] = useState(false);
  const [volume, setVolume] = useState(100);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const API_KEY = `${process.env.REACT_APP_GOOGLE_API_KEY}`
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
  const [duration] = useState([1, 2, 4, 7, 11, 16]);
  const [gameEnded, setGameEnded] = useState(false);
  const [songBar, setSongBar] = useState({ duration: duration[count], width: 0, })
  const [sectionColors, setSectionColors] = useState(
    [CURRENT, FUTURE, FUTURE, FUTURE, FUTURE, FUTURE]
  )
  const [items, setItems] = useState([]);
  const [video, setVideo] = useState({ videoId: '', maxTime: 0, title: 'dummyTitle' });
  const isToday = (someDate) => {
    const today = new Date()
    someDate = new Date(someDate);
    return someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
  }
  function movePotentialBar() {
    sectionColors[count] = PAST;
    sectionColors[count + 1] = CURRENT;
    attemptDetails[count].focus = false;
    attemptDetails[count + 1].focus = true;
    setSectionColors(sectionColors);
    console.log(count);
    setCount(count + 1);
  }
  function handleSkip() {
    setSkip(skip + 1);
    attemptDetails[count].value = "Skipped";
    attemptDetails[count].color = SKIPPED;
    setAttemptDetails(attemptDetails);
    if (count >= 5) {
      return handleEndGame();
    }
    movePotentialBar();
  }
  function handleEndGame() {
    setGameEnded(true);
    setSliderDisabled(true);
  }
  function handleGuess() {
    attemptDetails[count].value = input;
    setInput('');
    if (input === video.title) {
      attemptDetails[count].color = CORRECT;
      setCorrect(true);
      return handleEndGame();
    }
    attemptDetails[count].color = WRONG;
    if (count === 5) {
      return handleEndGame();
    }
    movePotentialBar();
  }
  function getRandomInt(max) { return Math.floor(Math.random() * max); }
  function handleSliderRelease(value) {
    var youtubeEmbedWindow = document.getElementById("secretVideo").contentWindow;
    var data = { event: 'command', func: 'seekTo', args: [value, true] }
    var message = JSON.stringify(data);
    youtubeEmbedWindow.postMessage(message, '*');
    youtubeEmbedWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  }
  function handleVolume(value) {
    var youtubeEmbedWindow = document.getElementById("secretVideo").contentWindow;
    var data = { event: 'command', func: 'setVolume', args: [value] }
    var message = JSON.stringify(data);
    youtubeEmbedWindow.postMessage(message, '*');

  }
  useEffect(() => { gameStart(); }, [])
  useEffect(() => {gameStart(); }, [gameEnded])
  const gameStart = async () => {
    const docRef = doc(db, "dailyHeardle", "kpop");
    const docSnap = await getDoc(docRef);
    const daily = docSnap.data();
    console.log(docSnap.data());
    if (isToday(daily.date)) {
      setVideo({ title: daily.title, maxTime: daily.maxTime, videoId: daily.videoId })
    }
    else {
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
      getRandomVideo(data, docRef);
    }
    setTimeout(() => setVideoLoaded(true), 1000);
  }

  async function getRandomVideo(data, docRef) {
    var randomVideoId = data[getRandomInt(data.length)].snippet.resourceId.videoId;
    var time;
    var response = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&id=${randomVideoId}&key=${API_KEY}`);
    var title = response.data.items[0].snippet.title;
    var timeString = response.data.items[0].contentDetails.duration;
    time = moment.duration(timeString, moment.ISO_8601).asSeconds();
    console.log(time)
    setVideo({ title: title, maxTime: time, videoId: randomVideoId });
    await updateDoc(docRef, {
      date: moment().format('MM-DD-YYYY'),
      title: title,
      maxTime: time,
      videoId: randomVideoId
    });
  }
  return (
    <div className="App" class="h-screen bg-[#1e293b]">
      <div class="text-center min-h-[10%]" >
        <Title />
      </div>
      <div className="Body" class="flex flex-col items-center space-y-4 min-h-[40%] ">
        {!gameEnded ?
          <Attempts attemptDetails={attemptDetails} />
          :
          <>
            <div class="space-y-16">
              <iframe width="560" height="315" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen />
              <Results startTime={startTime} isCorrect={correct} attemptDetails={attemptDetails} count={count} />
            </div>
            <Countdown setGameEnded={setGameEnded} />
          </>
        }
        <iframe id="secretVideo" width="0" height="0" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen />
      </div>
      <div className="Game" class="fixed  inset-x-0 bottom-0 min-h-[23%] flex flex-col items-center space-y-4">
        <GameBar duration={duration[count]} songBar={songBar} sectionColors={sectionColors} />
        <div class="w-2/6 flex flex-row">
          <input type="range" class="w-full" min="0" max={video.maxTime} value={startTime}
            onMouseUp={(e) => { handleSliderRelease(e.target.value) }}
            onInput={(e) => { setStartTime(e.target.value) }}
            disabled={sliderDisabled}
          />
          <p class="text-white">{Math.floor(startTime / 60)}:{startTime % 60 < 10 ? '0' + (startTime % 60) : startTime % 60}</p>
        </div>
        {
          !gameEnded ?
            <>
              {videoLoaded ?
                <PlayButton
                  duration={duration[count]}
                  gameEnded={gameEnded}
                  setSliderDisabled={setSliderDisabled}
                  setSongBar={setSongBar}
                  startTime={startTime}
                />
                :
                <Loading />
              }
              <div class="w-2/6 flex flex-row">
                <VolumeDown />
                <input type="range" class="w-full" min="0" max="100"
                  value={volume}
                  onMouseUp={(e) => { handleVolume(e.target.value) }}
                  onInput={(e) => { setVolume(e.target.value) }}
                />
                <VolumeUp />
              </div>
              <Autocomplete
                userInput={input}
                setUserInput={setInput}
                suggestions={
                  items.map(item => item.snippet.title)
                }
              />
              <div class="w-2/6 flex justify-between">
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-25 disabled:bg-blue-500"
                  onClick={handleSkip}
                >
                  Skip ({skip}s)
                </button>
                <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-25 disabled:bg-blue-500"
                  disabled={input === '' || !items.find((item) => item.snippet.title === input)}
                  onClick={handleGuess} >
                  Submit
                </button>
              </div>
            </>
            :
            <PlayButton
              duration={video.maxTime}
              gameEnded={gameEnded}
              setSliderDisabled={setSliderDisabled}
              setSongBar={setSongBar}
              startTime={startTime}
            />
        }
      </div>
    </div>
  );
}

export default App;
