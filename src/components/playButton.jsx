import React from "react";
import { useState } from "react";
import { useCookies } from "react-cookie";

export default function PlayButton({ setSliderDisabled, setSongBar, startTime, duration, gameEnded }) {
    const [cookies, setCookies] = useCookies(['user']);
    const [isPlaying, setIsPlaying] = useState(false);
    const youtubeEmbedWindow = document.querySelector('iframe[src*="youtube.com/embed"]').contentWindow;
    function handlePlay() {
        if (cookies.states) {
            var data = { event: 'command', func: 'seekTo', args: [cookies.states.startTime, true] }
            var message = JSON.stringify(data);
            youtubeEmbedWindow.postMessage(message, '*');
        }
        setSliderDisabled(true);
        youtubeEmbedWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        setTimeout(() => {
            setSongBar({ duration: 0, width: 0 });
            youtubeEmbedWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }, duration * 1000);
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
