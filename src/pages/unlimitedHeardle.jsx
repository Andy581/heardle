import Attempts from '../components/attempt';
import Title from '../components/title';
import GameBar from '../components/gameBar';
import { useState, useEffect } from 'react';
import PlayButton from '../components/playButton';
import axios from 'axios';
import Autocomplete from '../components/autocomplete';
import { Loading } from '../components/svg';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import moment from 'moment/moment';
import { getRandomInt } from '../common';
import { API_KEY, CURRENT, PAST, FUTURE, SKIPPED, WRONG, CORRECT, EMPTY_ATTEMPTS, DURATION } from '../constants';
import { StartTimeSlider, VolumeSlider } from '../components/sliders';
import { useParams } from 'react-router-dom';
import { Sidebar } from '../components/sidebar';
import { useCookies } from 'react-cookie';
import {v4 as uuidv4 } from 'uuid';
export function UnlimitedHeardle({ db }) {
    const [score, setScore] = useState(0);
    const [videos, setVideos] = useState([]);
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
    const [cookies, setCookies] = useCookies(['user']);
    const [video, setVideo] = useState({ videoId: '', maxTime: 0, title: 'dummyTitle' });
    const [originalVideos, setOriginalVideos] = useState([]);
    const [volume, setVolume] = useState(100);
    const { genre } = useParams();
    function movePotentialBar() {
        sectionColors[count] = PAST;
        sectionColors[count + 1] = CURRENT;
        attemptDetails[count].focus = false;
        attemptDetails[count + 1].focus = true;
        setAttemptDetails(attemptDetails);
        setSectionColors(sectionColors);
        setCount(count + 1);
        setSkip(skip + 1);
    }
    function handleSkip() {
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
        if (!sliderDisabled) setSliderDisabled(true);
        attemptDetails[count].value = input;
        setInput('');
        if (input === video.title) {
            setScore(score + 1);
            attemptDetails[count].color = CORRECT;
            if (score + 1 === originalVideos.length)
                return handleEndGame();
            return nextSong();
        }
        attemptDetails[count].color = WRONG;
        if (count === 5)
            return handleEndGame();
        movePotentialBar();
    }
    function resetStates() {
        setStartTime(0);
        setSliderDisabled(false);
        setGameEnded(false);
        setCount(0);
        setAttemptDetails(JSON.parse(JSON.stringify(EMPTY_ATTEMPTS)));
        setSkip(1);
        setVideoLoaded(false);
        setSongBar({ duration: DURATION[count], width: 0, });
        setSectionColors([CURRENT, FUTURE, FUTURE, FUTURE, FUTURE, FUTURE])
    }
    function nextSong() {
        resetStates()
        const newList = videos.filter((vid) => vid.title !== video.title);
        setVideos(newList);
        getRandomVideo(newList);
        setTimeout(() => setVideoLoaded(true), 200)

    }
    async function restartGame() {
        resetStates();
        setVideos(originalVideos);
        getRandomVideo(originalVideos)
        setTimeout(() => setVideoLoaded(true), 1000);
    }
    useEffect(() => { gameStart(); }, [])
    const gameStart = async () => {
        if (!cookies.uuid) {
            const uuid = uuidv4();
            setCookies('uuid', uuid, { expires: new Date(new Date().setFullYear(2024)), path: '/' })
            const docRef = doc(db, "users", "uuids");
            await updateDoc(docRef, { uuid: uuid })
          }
        const docRef = doc(db, "dailyHeardle", genre);
        const docSnap = await getDoc(docRef);
        const daily = docSnap.data();
        setVideos(daily.videos);
        setOriginalVideos(daily.videos);
        getRandomVideo(daily.videos)
        setTimeout(() => setVideoLoaded(true), 1000);
    }

    function handleVolume() {
        var youtubeEmbedWindow = document.getElementById("secretVideo").contentWindow;
        var data = { event: 'command', func: 'setVolume', args: [volume] }
        var message = JSON.stringify(data);
        youtubeEmbedWindow.postMessage(message, '*');
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
            <Sidebar />
            <div class="text-center min-h-[10%] text-white" >
                <Title />
            </div>
            <div className="Body" class="flex flex-col items-center space-y-4 min-h-[40%] ">
                {!gameEnded ?
                    <>
                        <p class="text-white">
                            Score {score} / {originalVideos.length}
                        </p>
                        <Attempts attemptDetails={attemptDetails} />
                        <iframe id="secretVideo" width="0" height="0" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen onLoad={handleVolume}/>
                    </>
                    :
                    <>
                        <div class="space-y-4 flex flex-col items-center">
                            <iframe width="560" height="315" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen />
                            <p class="text-white">
                                Score: {score}
                            </p>
                            <div class="flex flex-row justify-center space-x-1">
                                {attemptDetails.map((detail) => {
                                    return (
                                        <div style={{ backgroundColor: detail.color }} class="h-1 w-4" />
                                    )
                                })}
                            </div>
                            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded " onClick={restartGame}>
                                Restart Game
                            </button>
                        </div>
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
                            <VolumeSlider volume={volume} setVolume={setVolume}/>
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