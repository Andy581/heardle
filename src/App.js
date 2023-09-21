import logo from './logo.svg';
import './App.css';
import Attempt from './components/attempt';
import Title from './components/title';
import GameBar from './components/gameBar';
import { useState } from 'react';

function App() {
  const [attempts, setAttempts] = useState(['', '', '', '', '']);
  const [input, setInput] = useState('');
  const [skip, setSkip] = useState(1);
  const [duration, setDuration] = useState(1);
  const [songBar, setSongBar] = useState({duration: 1,width: 0,})
  const answer = "chaewon";
  function handleSkip() {
    setDuration(duration + skip);
    setSkip(skip + 1);
    console.log(duration);
  }
  function handlePlay() {
    var youtubeEmbedWindow = document.querySelector('iframe[src*="youtube.com/embed"]').contentWindow;
    youtubeEmbedWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    setSongBar({duration: duration, width: duration});
    setTimeout(() => {
      setSongBar({duration:0, width:0});
      youtubeEmbedWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      var data = { event: 'command', func: 'seekTo', args: [0, true] }
      var message = JSON.stringify(data);
      youtubeEmbedWindow.postMessage(message, '*');
    }, duration * 1000)
  }
  function handleGuess() {
    for (var i = 0; i < 5; i++) {
      if (attempts[i] === '') {
        attempts[i] = input;
        setAttempts(() => (attempts));
        break;
      }
    }
    if (input === answer) {
      alert("the answer is chaewon!");
    }
    setInput('');
  }
  return (
    <div className="App" class="h-screen ">
      <div class="text-center min-h-[10%]" >
        <Title />
      </div>
      <div className="Body" class="flex flex-col items-center space-y-4 min-h-[70%]">
        <Attempt value={attempts[0]} />
        <Attempt value={attempts[1]} />
        <Attempt value={attempts[2]} />
        <Attempt value={attempts[3]} />
        <Attempt value={attempts[4]} />
        <iframe width="560" height="315" src="https://www.youtube.com/embed/8UOEW3czU6U?enablejsapi=1&version=3" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
      </div>
      <div className="Game" class="flex flex-col items-center space-y-2">
        <GameBar duration={duration} songBar={songBar}/>
        <button type="button" onClick={handlePlay}>
          <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" />
          </svg>
          <span class="sr-only">Play Button</span>
        </button>
        <label class="w-3/6 border-2 border-solid">
          <input class="w-full" value={input} onChange={e => setInput(e.target.value)} />
        </label>
        <div class="w-3/6 flex justify-between">
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded " onClick={handleSkip}>
            Skip ({skip}s)
          </button>
          <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={false} onClick={handleGuess} >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
