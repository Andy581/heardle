import React from "react";

export default function PlayButton({ setSliderDisabled, setSongBar, startTime, duration}) {
    function handlePlay() {
        const youtubeEmbedWindow = document.querySelector('iframe[src*="youtube.com/embed"]').contentWindow;
        setSliderDisabled(true);
        youtubeEmbedWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        setTimeout(() => {
            setSongBar({ duration: 0, width: 0 });
            var data = { event: 'command', func: 'seekTo', args: [startTime, true] }
            var message = JSON.stringify(data);
            youtubeEmbedWindow.postMessage(message, '*');
            youtubeEmbedWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }, duration * 1000);
        setSongBar({ duration: duration, width: duration });
    }

    return (
        <button class="z-10" type="button" onClick={handlePlay}>
             <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            <span class="sr-only">Play Button</span>
        </button>
    )
}
