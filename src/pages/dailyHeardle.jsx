import axios from 'axios';
import Attempts from '../components/attempt';
import Title from '../components/title';
import GameBar from '../components/gameBar';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import PlayButton from '../components/playButton';
import Countdown from '../components/countdown'
import Results from '../components/results';
import Autocomplete from '../components/autocomplete';
import { Loading } from '../components/svg';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import moment from 'moment/moment';
import { handleLoad, isToday, getRandomVideo, getRandomInt } from '../common';
import { API_KEY, CURRENT, PAST, FUTURE, SKIPPED, WRONG, CORRECT, EMPTY_ATTEMPTS, DURATION } from '../constants';
import { StartTimeSlider, VolumeSlider } from '../components/sliders';
import { Sidebar } from '../components/sidebar';
import { useCookies } from 'react-cookie';
import { RandomButton } from '../components/randomButton';

export function DailyHeardle({ db }) {
  const Ref = useRef(null);
  const [filteredSuggestions, setFilterSuggestions] = useState([]);
  const [correct, setCorrect] = useState(false);
  const [startTime, setStartTime] = useState(1);
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
  const [copied, setCopied] = useState(false);
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
    setStartTime(1);
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
      const docRef = doc(db, "dailyHeardle", genre);
      const docSnap = await getDoc(docRef);
      const daily = docSnap.data();
      getTodayRandomVideo(daily.videos, docRef);
    }
  }

  async function getTodayRandomVideo(videos, docRef) {
    var randomVideo = videos[getRandomInt(videos.length)];
    var time;
    var response = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&id=${randomVideo.videoId}&key=${API_KEY}`);
    var timeString = response.data.items[0].contentDetails.duration;
    time = moment.duration(timeString, moment.ISO_8601).asSeconds();
    setVideo({ title: randomVideo.title, maxTime: time, videoId: randomVideo.videoId });
    setTitles(videos.map(video => video.title));
    await updateDoc(docRef, {
      date: moment().format('MM-DD-YYYY'),
      title: randomVideo.title,
      maxTime: time,
      videoId: randomVideo.videoId,
      videos:  videos } );
  }

  function handleCopy() {
    var title = genre === "kpop" ? "Kpop" : "Taylor Swift"
    var res = title + " Heardle " + moment().format("MMM Do YYYY") + "\n";
    var colorHash = {
      '#808080': '⬛',
      '#ff0000': '🟥',
      '#008000': '🟩',
      '#ffffff': '⬜',
    }
    attemptDetails.forEach(attempt => {
      res += colorHash[attempt.color] + " "
    });
    res += "\n https://ytheardle.netlify.app/daily/" + genre
    navigator.clipboard.writeText(res);
    setCopied(true);

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
            <div class="">
              <iframe id="secretVideo" width="0" height="0" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen onLoad={() => handleLoad({ cookies, setVideoLoaded })} />
            </div>
          </>
          :
          <>
            <div class="space-y-16">
              <iframe width="560" height="315" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen />
              <Results startTime={startTime} isCorrect={correct} attemptDetails={attemptDetails} count={count} />
            </div>
            <Countdown restartGame={restartGame} />
            {
              copied && <p class="text-[#85a5bb]"> Copied to Clipboard </p>
            }
            <button class="bg-[#bf616a]  text-white font-bold py-2 px-4 rounded"
              onClick={handleCopy}
            >
              SHARE
            </button>

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
                <div class="flex flex-col space-y-4">
                  <RandomButton maxTime={video.maxTime} setStartTime={setStartTime} sliderDisabled={sliderDisabled} />

                  <PlayButton
                    duration={DURATION[count]}
                    gameEnded={gameEnded}
                    setSliderDisabled={setSliderDisabled}
                    setSongBar={setSongBar}
                    startTime={startTime}
                  />
                </div>
                :
                <Loading />
              }
              <VolumeSlider volume={volume} setVolume={setVolume} suggestions={filteredSuggestions} input={input} />
              <Autocomplete userInput={input} setUserInput={setInput} suggestions={titles} handleGuess={handleGuess} filteredSuggestions={filteredSuggestions} setFilterSuggestions={setFilterSuggestions} />
              <div class="w-2/6 max-[768px]:w-full flex justify-between">
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

