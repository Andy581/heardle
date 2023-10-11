import axios from 'axios';
import moment from 'moment';
import Title from '../components/title';
import GameBar from '../components/gameBar';
import { useState, useEffect } from 'react';
import PlayButton from '../components/playButton';
import { Loading } from '../components/svg';
import { ytSetStartTime, ytSetVolume } from '../common';
import { API_KEY, CURRENT, PAST, FUTURE, SKIPPED, WRONG, CORRECT, EMPTY_ATTEMPTS, DURATION } from '../constants';
import { StartTimeSlider, VolumeSlider } from '../components/sliders';
import { useParams } from 'react-router-dom';
import { Sidebar } from '../components/sidebar';
import { useCookies } from 'react-cookie';
export function HelpFriend() {
    const [startTime, setStartTime] = useState(1);
    const [sliderDisabled, setSliderDisabled] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [sectionColors, setSectionColors] = useState(
        [CURRENT, FUTURE, FUTURE, FUTURE, FUTURE, FUTURE]
    )
    const [cookies, setCookies] = useCookies(['user']);
    const [video, setVideo] = useState({ videoId: '', maxTime: 0, title: 'dummyTitle' });
    const [volume, setVolume] = useState(100);
    const params = useParams();
    const [songBar, setSongBar] = useState({ duration: DURATION[params.count], width: 0, });
    function handleLoad() {
        if (document.getElementById("secretVideo")) {
            if (cookies.volume) ytSetVolume(cookies.volume);
            ytSetStartTime(params.startTime);
            setVideoLoaded(true);
        }
    }
    useEffect(() => { gameStart(); }, [])
    const gameStart = async () => {
        const colorHash  = {
            'C': CURRENT,
            'F': FUTURE,
            'P': PAST
        }
        for (let i = 0; i < params.sectionColors.length; i++) {
            sectionColors[i] = colorHash[params.sectionColors.charAt(i)];
        }
        setSectionColors(sectionColors);
        setStartTime(params.startTime);
        var response = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&id=${params.videoId}&key=${API_KEY}`);
        var title = response.data.items[0].snippet.title;
        var timeString = response.data.items[0].contentDetails.duration;
        var time = moment.duration(timeString, moment.ISO_8601).asSeconds();
        setVideo({ title: title, maxTime: time, videoId: params.videoId });

    }

    return (
        <div className="App" class="h-screen bg-[#1e293b]">
            <Sidebar />
            <div class="text-center min-h-[10%] text-white" >
                <Title />
            </div>
            <div className="Body" class="flex flex-col items-center space-y-4 min-h-[40%] ">
                <iframe id="secretVideo" width="0" height="0" src={`https://www.youtube.com/embed/${video.videoId}?&enablejsapi=1`} title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen onLoad={()=> handleLoad({cookies, setVideoLoaded})} />
            </div>
            <div className="Game" class="fixed  inset-x-0 bottom-0 min-h-[23%] flex flex-col items-center space-y-4">
                <GameBar duration={DURATION[params.count]} songBar={songBar} sectionColors={sectionColors} />
                <StartTimeSlider startTime={startTime} setStartTime={setStartTime} sliderDisabled={sliderDisabled} video={video} />
                {
                    videoLoaded ? 

                    <PlayButton
                                        duration={DURATION[params.count]}
                                        setSliderDisabled={setSliderDisabled}
                                        setSongBar={setSongBar}
                                        startTime={startTime}
                    />
                    :
                    <Loading/>
                }
                <VolumeSlider volume={volume} setVolume={setVolume} />
            </div>
        </div>
    );
}