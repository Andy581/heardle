import React from "react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useEffect } from "react";

export default function PlayButton({ setSliderDisabled, setSongBar, startTime, duration, gameEnded }) {
    const [cookies, setCookies] = useCookies(['user']);
    const [isPlaying, setIsPlaying] = useState(false);
    const youtubeEmbedWindow = document.querySelector('iframe[src*="youtube.com/embed"]').contentWindow;
    useEffect(() => {
        
        const handler = (msg) => {
            if (msg.origin === "https://www.youtube.com" && typeof(msg.data) == "string" && msg.data.length !== 0 && msg.data[0] !== "w"){ 
                var data = JSON.parse(msg.data);
                if (data.event && data.event === 'infoDelivery' )  {
                    var info = data.info;
                    if (info.currentTime && info.currentTime >= startTime + duration) {
                        setSongBar({ duration: 0, width: 0 });
                        var data = { event: 'command', func: 'seekTo', args: [startTime, true] }
                        var message = JSON.stringify(data);
                        youtubeEmbedWindow.postMessage(message, '*');
                        youtubeEmbedWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    }
                }
            }
        }
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);

    })
    function handlePlay() {
        setSliderDisabled(true);
        youtubeEmbedWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        setSongBar({ duration: duration, width: duration });
    }
    function handlePlay2() {
        youtubeEmbedWindow.postMessage('{"event":"listening","id":1,"channel":"widget"}', '*');
        youtubeEmbedWindow.postMessage('{"event":"command","func":"getPlayerState","args":""}', '*');
        if (isPlaying) {
            youtubeEmbedWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        } else {
            youtubeEmbedWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }
        setIsPlaying(!isPlaying);
    }
    return (
        <button class="z-10" type="button" onClick={!gameEnded ? handlePlay : handlePlay2}>
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
            <span class="sr-only">Play Button</span>
        </button>
    )
}
