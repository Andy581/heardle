import React, { useState } from "react";
import { Sidebar } from "../components/sidebar";
import Title from "../components/title";
import axios from "axios";
import isUrlHttp from "is-url-http";
import { API_KEY, CURRENT, PAST, FUTURE, SKIPPED, WRONG, CORRECT, EMPTY_ATTEMPTS, DURATION } from '../constants';
import { getRandomVideo, handleLoad, handleAsk } from "../common";
import Attempts from "../components/attempt";
import { StartTimeSlider, VolumeSlider } from "../components/sliders";
import PlayButton from "../components/playButton";
import GameBar from "../components/gameBar";
import Autocomplete from "../components/autocomplete";
import { Loading } from "../components/svg";
import { useCookies } from "react-cookie";
export function CustomPlaylist() {
    const [cookies, setCookies] = useCookies(['user'])
    const [playlistLink, setPlaylistLink] = useState('');
    const [hidden, setHidden] = useState(false);
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
    const [video, setVideo] = useState({ videoId: '', maxTime: 0, title: 'dummyTitle' });
    const [volume, setVolume] = useState(100);
    const [originalVideos, setOriginalVideos] = useState([]);
    const [invalid, setInvalid] = useState({
        invalid: false,
        reason: "",
    })
    const [copied, setCopied] = useState(false);
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
        setSongBar({ duration: 0, width: 0, });
        setSectionColors([CURRENT, FUTURE, FUTURE, FUTURE, FUTURE, FUTURE])
        setCopied(false);
    }
    function nextSong() {
        resetStates()
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
        getRandomVideo(videos, { setVideo, setTitles });

    }
    async function restartGame() {
        resetStates();
        setVideos(originalVideos);
        setOriginalVideos(JSON.parse(JSON.stringify(originalVideos)));
        setScore(0);
        getRandomVideo(originalVideos, { setVideo, setTitles });
    }
    async function handleModal() {
        if (!isUrlHttp(playlistLink)) { setInvalid({ invalid: true, reason: "Invalid URL" }); return; }
        const url = new URL(playlistLink);
        const urlParams = new URLSearchParams(url.search);
        const id = urlParams.get('list');
        if (id === '') { setInvalid({ invalid: true, reason: "URL missing link param" }); return; }
        var response = await axios.get(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${id}&key=${API_KEY}`, { validateStatus: false });
        if (response.status !== 200) { setInvalid({ invalid: true, reason: "Invalid Youtube Playlist" }); return; }
        setHidden(!hidden);
        gameStart(id);
    }
    async function gameStart(id) {
        var pageInfo;
        var nextPageToken = '';
        var playlist = await axios.get(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${id}&key=${API_KEY}`, { validateStatus: false });

        pageInfo = playlist.data.pageInfo;
        var videos = [];
        videos = videos.concat(playlist.data.items);
        for (let i = 1; i < Math.ceil(pageInfo.totalResults / pageInfo.resultsPerPage); i++) {
            var nextPage = await axios.get(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${nextPageToken}&playlistId=${id}&key=${API_KEY}`);
            videos = videos.concat(nextPage.data.items);
            nextPageToken = nextPage.data.nextPageToken;
        }
        videos = videos.map((video) => { return { videoId: video.snippet.resourceId.videoId, title: video.snippet.title } });
        setOriginalVideos(JSON.parse(JSON.stringify(videos)));
        setVideos(videos);
        getRandomVideo(videos, { setVideo, setTitles });

    }
    return (
        <div class="h-screen bg-[#1e293b]">
            <Sidebar />
            <div class="text-center min-h-[10%] text-white" >
                <Title />
            </div>
            <div className="Body" class="flex flex-col items-center space-y-4 min-h-[40%]" >
                <div style={{ display: hidden ? "none" : "" }} class="fixed z-50 w-[100%] p-4  ">
                    <div class="relative w-full max-w-2xl mx-auto max-h-full">
                        {/* <!-- Modal content --> */}
                        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            {/* <!-- Modal header --> */}
                            <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                                    Custom Playlist </h3>
                            </div>
                            {/* <!-- Modal body --> */}
                            <div class="p-6 space-y-4">
                                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Public/Unlisted Playlist URL (cannot be a Youtube My Mix)</label>
                                <input type="text" placeholder="https://www.youtube.com/playlist?list=PLOHoVaTp8R7dfrJW5pumS0iD_dhlXKv17" style={{ borderColor: invalid.invalid ? "#ef4444" : "#d1d5db" }} class="bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" value={playlistLink} onChange={(e) => setPlaylistLink(e.target.value)}></input>
                                <p class="text-white">{invalid.reason}</p>
                            </div>
                            {/* <!-- Modal footer --> */}
                            <div class=" w-full p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600"> <button type="button" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={handleModal}> Submit </button>
                            </div>
                        </div>
                    </div>
                </div>
                {!gameEnded ?
                    <>
                        <p class="text-white"> Score {score} / {originalVideos.length}
                        </p> <Attempts attemptDetails={attemptDetails} />
                        <div class="hidden">

                            <iframe id="secretVideo" width="560" height="360" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen onLoad={() => handleLoad({ cookies, setVideoLoaded })} />
                        </div>
                    </>
                    :
                    <>
                        <div class="space-y-4 flex flex-col items-center">
                            <iframe width="560" height="315" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen />
                            <p class="text-white"> Score: {score} </p>
                            <div class="flex flex-row justify-center space-x-1">
                                {attemptDetails.map((detail) => { return (<div style={{ backgroundColor: detail.color }} class="h-1 w-4" />) })}
                            </div>
                            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded " onClick={restartGame}> Restart Game
                            </button>
                        </div>
                    </>
                }
            </div>
            <div className="Game" class="fixed  inset-x-0 bottom-0 min-h-[23%] flex flex-col items-center space-y-4">
                <GameBar duration={DURATION[count]} songBar={songBar} sectionColors={sectionColors} />
                <StartTimeSlider startTime={startTime} setStartTime={setStartTime} sliderDisabled={sliderDisabled} video={video} />
                {!gameEnded ?
                    <>
                        {videoLoaded ?
                            <PlayButton duration={DURATION[count]} gameEnded={gameEnded} setSliderDisabled={setSliderDisabled} setSongBar={setSongBar} startTime={startTime} />
                            :
                            <Loading />
                        }
                        <VolumeSlider volume={volume} setVolume={setVolume} />
                        <Autocomplete userInput={input} setUserInput={setInput} suggestions={titles} handleGuess={handleGuess} />
                        <div class="w-2/6 flex justify-between">
                            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-25 disabled:bg-blue-500" disabled={!hidden} onClick={handleSkip} > Skip ({skip}s)
                            </button>
                            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => handleAsk(video.videoId, startTime, count, sectionColors, { setCopied })}
                            >
                                Ask a friend
                            </button>
                            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-25 disabled:bg-blue-500" disabled={input === '' || !titles.find((title) => title === input)} onClick={handleGuess} >
                                Submit </button>
                        </div>
                        {
                            copied && <p class="text-[#85a5bb]" > Copied to Clipboard </p>
                        }
                    </>
                    :
                    <PlayButton duration={video.maxTime} gameEnded={gameEnded} setSliderDisabled={setSliderDisabled} setSongBar={setSongBar} startTime={startTime} />
                }
            </div>
        </div>
    )
}