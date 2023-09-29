import Attempts from '../components/attempt';
import Title from '../components/title';
import GameBar from '../components/gameBar';
import { useState, useEffect, useRef } from 'react';
import PlayButton from '../components/playButton';
import Countdown from '../components/countdown'
import axios from 'axios';
import Autocomplete from '../components/autocomplete';
import Results from '../components/results';
import { Loading } from '../components/svg';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import moment from 'moment/moment';
import { getRandomInt, isToday } from '../common';
import { CURRENT, PAST, FUTURE, SKIPPED, WRONG, CORRECT, EMPTY_ATTEMPTS, DURATION } from '../constants';
import { StartTimeSlider, VolumeSlider } from '../components/sliders';
import { useParams } from 'react-router-dom';
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
export function UnlimitedHeardle() {
    const [score, setScore] = useState(0);
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
    const API_KEY = `${process.env.REACT_APP_GOOGLE_API_KEY}`
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
            setScore(score+1);
            return nextSong();
        }
        if (count === 5) {
            return handleEndGame();
        }
        movePotentialBar();
    }
    function nextSong() {
        setStartTime(0);
        setSliderDisabled(false);
        setGameEnded(false);
        setCount(0);
        setAttemptDetails(JSON.parse(JSON.stringify(EMPTY_ATTEMPTS)));
        setSkip(1);

    }
    async function restartGame() {
        setStartTime(0);
        setSliderDisabled(false);
        setGameEnded(false);
        setCount(0);
        setAttemptDetails(JSON.parse(JSON.stringify(EMPTY_ATTEMPTS)));
        setSkip(1);
        await gameStart();
    }
    useEffect(() => { gameStart(); }, [])
    const gameStart = async () => {
        const docRef = doc(db, "dailyHeardle", "kpop");
        const docSnap = await getDoc(docRef);
        const daily = docSnap.data();
        const videos = daily.videos;
        getRandomVideo(videos)
        setTimeout(() => setVideoLoaded(true), 1000);
    }

    async function getRandomVideo(videos) {
        var randomVideo = videos[getRandomInt(videos.length)];
        var time;
        var response = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&id=${randomVideo.videoId}&key=${API_KEY}`);
        var timeString = response.data.items[0].contentDetails.duration;
        time = moment.duration(timeString, moment.ISO_8601).asSeconds();
        setVideo({ title: randomVideo.title, maxTime: time, videoId: randomVideo.videoId });
        setTitles(videos.map(video => video.title))
    }
    return (
        <div className="App" class="h-screen bg-[#1e293b]">
            <div class="text-center min-h-[10%]" >
                <Title />
            </div>
            <div className="Body" class="flex flex-col items-center space-y-4 min-h-[40%] ">
                {!gameEnded ?
                    <>
                        <Attempts attemptDetails={attemptDetails} />
                        <iframe id="secretVideo" width="560" height="310" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen />
                    </>
                    :
                    <>
                        <div class="space-y-16">
                            <iframe width="560" height="315" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen />
                            {/* TODO: Need to create a new results page */}
                            {/* <Results startTime={startTime} isCorrect={correct} attemptDetails={attemptDetails} count={count} /> */} 
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
                            <VolumeSlider />
                            <Autocomplete userInput={input} setUserInput={setInput} suggestions={titles} />
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