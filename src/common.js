export function getRandomInt(max) { return Math.floor(Math.random() * max); }
export function handleSliderRelease(value) {
    var youtubeEmbedWindow = document.getElementById("secretVideo").contentWindow;
    var data = { event: 'command', func: 'seekTo', args: [value, true] }
    var message = JSON.stringify(data);
    youtubeEmbedWindow.postMessage(message, '*');
    youtubeEmbedWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  }
