import Attempts from '../components/attempt';
import Title from '../components/title';
import GameBar from '../components/gameBar';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import PlayButton from '../components/playButton';
import Countdown from '../components/countdown'
import axios from 'axios';
import Autocomplete from '../components/autocomplete';
import Results from '../components/results';
import { Loading } from '../components/svg';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import moment from 'moment/moment';
import { getRandomInt, isToday } from '../common';
import { API_KEY, CURRENT, PAST, FUTURE, SKIPPED, WRONG, CORRECT, EMPTY_ATTEMPTS, DURATION, PLAYLIST_ID } from '../constants';
import { StartTimeSlider, VolumeSlider } from '../components/sliders';
import { Sidebar } from '../components/sidebar';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';

export function DailyHeardle({ db }) {
  const Ref = useRef(null);
  const [correct, setCorrect] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [sliderDisabled, setSliderDisabled] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [attemptDetails, setAttemptDetails] = useState(JSON.parse(JSON.stringify(EMPTY_ATTEMPTS)))
  const [input, setInput] = useState('');
  const [count, setCount] = useState(0);
  const [skip, setSkip] = useState(1);
  const [gameEnded, setGameEnded] = useState(false);
  const [songBar, setSongBar] = useState({ duration: DURATION[count], width: 0, });
  const [sectionColors, setSectionColors] = useState(
    [CURRENT, FUTURE, FUTURE, FUTURE, FUTURE, FUTURE]
  )
  const [titles, setTitles] = useState([]);
  const [video, setVideo] = useState({ videoId: '', maxTime: 0, title: 'dummyTitle' });
  const [curDay, setCurDay] = useState(new Date().getDate());
  const [cookies, setCookies] = useCookies(['user']);
  const [volume, setVolume] = useState(100);
  const { genre } = useParams();
  function movePotentialBar() {
    sectionColors[count] = PAST;
    sectionColors[count + 1] = CURRENT;
    attemptDetails[count].focus = false;
    attemptDetails[count + 1].focus = true;
    handleCookieStates(attemptDetails, sectionColors);
    setSectionColors(sectionColors);
    setCount(count + 1);
    setSkip(skip + 1);
  }
  function handleCookieStates(attemptDetails, sectionColors) {
    const states = {
      attemptDetails: attemptDetails,
      count: count + 1,
      skip: skip + 1,
      startTime: startTime,
      sectionColors: sectionColors,
      songBar: songBar,
    }
    setCookies('states', states, { expires: new Date(new Date().setHours(24, 0, 0, 0, 0)), path: `/daily/${genre}` });
  }
  function handleSkip() {
    attemptDetails[count].value = "Skipped";
    attemptDetails[count].color = SKIPPED;
    handleCookieStates(attemptDetails, sectionColors);
    setAttemptDetails(attemptDetails);
    if (count >= 5) {
      return handleEndGame();
    }
    movePotentialBar();
  }
  function handleEndGame() {
    setCookies('done', true, { expires: new Date(new Date().setHours(24, 0, 0, 0)), path: `/daily/${genre}` })
    clearInterval(Ref.current);
    setGameEnded(true);
    setSliderDisabled(true);
  }
  function handleGuess() {
    if (!sliderDisabled) setSliderDisabled(true);
    attemptDetails[count].value = "❌" + input;
    setInput('');
    if (input === video.title) {
      attemptDetails[count].color = CORRECT;
      handleCookieStates(attemptDetails, sectionColors);
      setCorrect(true);
      return handleEndGame();
    }
    attemptDetails[count].color = WRONG;
    handleCookieStates(attemptDetails);
    if (count === 5) {
      return handleEndGame();
    }
    movePotentialBar();
  }
  async function restartGame() {
    setCorrect(false);
    setStartTime(0);
    setSliderDisabled(false);
    setGameEnded(false);
    setCount(0);
    setAttemptDetails(JSON.parse(JSON.stringify(EMPTY_ATTEMPTS)));
    setSkip(1);
    setCorrect(false);
    setVideoLoaded(false);
    setCurDay(new Date().getDate());
    await gameStart();
  }
  function checkDay() {
    if (curDay !== new Date().getDate()) {
      clearInterval(Ref.current);
      restartGame();
    }
  }
  useEffect(() => { gameStart(); }, [])
  const gameStart = async () => {
    if (!cookies.uuid) {
      const uuid = uuidv4();
      setCookies('uuid', uuid, { expires: new Date(new Date().setFullYear(2024)), path: '/' })
      const docRef = doc(db, "users", uuid);
      await setDoc(docRef, { uuid: uuid })
    }
    if (cookies.states) {
      setAttemptDetails(cookies.states.attemptDetails);
      setStartTime(cookies.states.startTime);
      setSliderDisabled(true);
      setSkip(cookies.states.skip);
      setSectionColors(cookies.states.sectionColors);
      setCount(cookies.states.count);
      setSongBar(cookies.states.songBar);
    }
    if (cookies.done)
      setGameEnded(true);
    const dayId = setInterval(() => {
      checkDay();
    }, 1000);
    Ref.current = dayId;
    const docRef = doc(db, "dailyHeardle", genre);
    const docSnap = await getDoc(docRef);
    const daily = docSnap.data();
    if (isToday(daily.date)) {
      setVideo({ title: daily.title, maxTime: daily.maxTime, videoId: daily.videoId })
      setTitles(daily.videos.map(video => video.title));
    }
    else {
      var pageInfo;
      var nextPageToken = '';
      var playlist = await axios.get(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID[genre]}&key=${API_KEY}`);
      pageInfo = playlist.data.pageInfo;
      var data = []
      data = data.concat(playlist.data.items);
      nextPageToken = playlist.data.nextPageToken;
      console.log("page info ", pageInfo.totalResults)
      for (let i = 1; i < Math.ceil(pageInfo.totalResults / pageInfo.resultsPerPage); i++) {
        var nextPage = await axios.get(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${nextPageToken}&playlistId=${PLAYLIST_ID[genre]}&key=${API_KEY}`);
        data = data.concat(nextPage.data.items);
        nextPageToken = nextPage.data.nextPageToken;
      }
      getRandomVideo(data, docRef);
    }
  }

  async function getRandomVideo(data, docRef) {
    var randomVideoId = data[getRandomInt(data.length)].snippet.resourceId.videoId;
    var time;
    var response = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&id=${randomVideoId}&key=${API_KEY}`);
    var title = response.data.items[0].snippet.title;
    var timeString = response.data.items[0].contentDetails.duration;
    time = moment.duration(timeString, moment.ISO_8601).asSeconds();
    setVideo({ title: title, maxTime: time, videoId: randomVideoId });
    setTitles(data.map(data => data.snippet.title))
    await updateDoc(docRef, {
      date: moment().format('MM-DD-YYYY'),
      title: title,
      maxTime: time,
      videoId: randomVideoId,
      videos: data.map(data => { return { title: data.snippet.title, videoId: data.snippet.resourceId.videoId } })
    });
  }
  function handleLoad() {
    if (cookies.volume && document.getElementById("secretVideo")) {
      var youtubeEmbedWindow = document.getElementById("secretVideo").contentWindow;
      var data = { event: 'command', func: 'setVolume', args: [cookies.volume] }
      var message = JSON.stringify(data);
      youtubeEmbedWindow.postMessage(message, '*');
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
  return (
    <div class="h-screen bg-[#1e293b] ">
      <Sidebar />
      <div class="text-center min-h-[5%]" >
        <Title />
      </div>
      <div className="Body" class="flex flex-col items-center space-y-4 min-h-[40%] ">
        {!gameEnded ?
          <>
            <Attempts attemptDetails={attemptDetails} />
            <iframe id="secretVideo" width="0" height="0" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen onLoad={handleLoad} />
          </>
          :
          <>
            <div class="space-y-16">
              <iframe width="560" height="315" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen />
              <Results startTime={startTime} isCorrect={correct} attemptDetails={attemptDetails} count={count} />
            </div>
            <Countdown restartGame={restartGame} />
          </>
        }
      </div>
      <div className="Game" class="fixed  inset-x-0 bottom-0 min-h-[23%] flex flex-col items-center space-y-4">
        <GameBar duration={DURATION[count]} songBar={songBar} sectionColors={sectionColors} />
        <StartTimeSlider startTime={startTime} setStartTime={setStartTime} sliderDisabled={sliderDisabled} video={video} />
        {
          !gameEnded ?
            <>
              {videoLoaded ?
                <PlayButton
                  duration={DURATION[count]}
                  gameEnded={gameEnded}
                  setSliderDisabled={setSliderDisabled}
                  setSongBar={setSongBar}
                  startTime={startTime}
                />
                :
                <Loading />
              }
              <VolumeSlider volume={volume} setVolume={setVolume} />
              <Autocomplete userInput={input} setUserInput={setInput} suggestions={titles} handleGuess={handleGuess} />
              <div class="w-2/6 flex justify-between">
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-25 disabled:bg-blue-500"
                  onClick={handleSkip}
                >
                  Skip ({skip}s)
                </button>
                <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-25 disabled:bg-blue-500"
                  disabled={input === '' || !titles.find((title) => title === input)}
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

