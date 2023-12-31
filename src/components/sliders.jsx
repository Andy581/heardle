import React, { useEffect } from "react";
import { VolumeDown, VolumeUp } from "./svg"
import { useCookies } from "react-cookie";
export function VolumeSlider({volume, setVolume, suggestions, input}) {
    const [cookies, setCookies] = useCookies(['user'])
    useEffect(() => {
      if (cookies.volume) {
        setVolume(cookies.volume)
        handleVolume(cookies.volume)
      }
    }, [])
    function handleVolume(value) {
        setVolume(value)
        setCookies('volume', value, {expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1 )), path: '/'})
        var youtubeEmbedWindow = document.getElementById("secretVideo").contentWindow;
        var data = { event: 'command', func: 'setVolume', args: [value] }
        var message = JSON.stringify(data);
        youtubeEmbedWindow.postMessage(message, '*');
      }
    return (
        <div class="z-10 w-2/6 max-[768px]:w-5/6 flex flex-row">
        <VolumeDown />
        <input type="range" class="w-full" min="0" max="100"
          value={volume}
          onMouseUp={(e) => { handleVolume(e.target.value) }}
          onInput={(e) => { setVolume(e.target.value) }}
          disabled={suggestions.length !== 0 && input !== ''}
        />
        <VolumeUp />
      </div>
    )
}

export function StartTimeSlider({startTime, setStartTime, sliderDisabled, video}) {
  function handleSliderRelease(value) {
    var youtubeEmbedWindow = document.getElementById("secretVideo").contentWindow;
    var data = { event: 'command', func: 'seekTo', args: [value, true] }
    var message = JSON.stringify(data);
    youtubeEmbedWindow.postMessage(message, '*');
    youtubeEmbedWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  }

  return (
    <div class="w-2/6 max-[768px]:w-5/6 flex flex-row">
    <input type="range" class="w-full" min="0" max={video.maxTime} value={startTime}
      onMouseUp={(e) => { handleSliderRelease(e.target.value) }}
      onInput={(e) => { setStartTime(e.target.value) }}
      disabled={sliderDisabled}
    />
    <p class="text-white">{Math.floor(startTime / 60)}:{startTime % 60 < 10 ? '0' + (startTime % 60) : startTime % 60}</p>
  </div>
  )
}