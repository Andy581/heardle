import React from "react";
import { useState } from "react";
import { VolumeDown, VolumeUp } from "./svg"
export default function Volume() {
    const [volume, setVolume] = useState(100);
    function handleVolume(value) {
        var youtubeEmbedWindow = document.getElementById("secretVideo").contentWindow;
        var data = { event: 'command', func: 'setVolume', args: [value] }
        var message = JSON.stringify(data);
        youtubeEmbedWindow.postMessage(message, '*');
      }
    return (
        <div class="w-2/6 flex flex-row">
        <VolumeDown />
        <input type="range" class="w-full" min="0" max="100"
          value={volume}
          onMouseUp={(e) => { handleVolume(e.target.value) }}
          onInput={(e) => { setVolume(e.target.value) }}
        />
        <VolumeUp />
      </div>
    )
}