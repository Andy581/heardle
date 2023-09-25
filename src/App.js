import logo from './logo.svg';
import './App.css';
import Attempt from './components/attempt';
import Title from './components/title';
import GameBar from './components/gameBar';
import PlayButton from './components/playButton';
import { VolumeDown, VolumeUp } from './components/svg';
import Autocomplete from './components/autocomplete';
import { useState } from 'react';

function App() {
  const CURRENT = '#afcbdd';
  const PAST = '#000000';
  const FUTURE = '#505050';
  const [attemptDetails, setAttemptDetails] = useState(
    [
      {focus: true, value: "", skipped: false},
      {focus: false, value: "", skipped: false},
      {focus: false, value: "", skipped: false},
      {focus: false, value: "", skipped: false},
      {focus: false, value: "", skipped: false},
      {focus: false, value: "", skipped: false},
    ]
  )
  const [input, setInput] = useState('');
  const [count, setCount] = useState(0);
  const [skip, setSkip] = useState(1);
  const [volume, setVolume] = useState(100);
  const [duration] = useState([1, 2, 4, 7, 11, 16]);
  const [songBar, setSongBar] = useState({duration: duration[count],width: 0,})
  const [sectionColors, setSectionColors] = useState(
    [CURRENT, FUTURE, FUTURE, FUTURE, FUTURE, FUTURE]
  )
  const [startTime, setStartTime] = useState(0);
  const [sliderDisabled, setSliderDisabled] = useState(false);

  const answer = "chaewon";
  function moveBar() {
    sectionColors[count] = PAST;
    sectionColors[count+1] = CURRENT;
    attemptDetails[count].focus = false;
    attemptDetails[count+1].focus = true;
    setSectionColors(sectionColors);
    setCount(count+1);
  }
  function handleSkip() {
    setSkip(skip + 1);
    attemptDetails[count].skipped = true;
    setAttemptDetails(attemptDetails);
    moveBar();

  }
  function handlePlay() {
    var youtubeEmbedWindow = document.querySelector('iframe[src*="youtube.com/embed"]').contentWindow;
    youtubeEmbedWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    setTimeout(()=> {
      setSongBar({duration: 0, width: 0});
      youtubeEmbedWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
    }, duration[count]*1000);
    setSongBar({duration: duration[count], width: duration[count]});
    // KEEP THIS CODE FOR SLIDER FEATURE. IM GONNA FORGET HOW TO DO THIS
    // var data = { event: 'command', func: 'seekTo', args: [0, true] }
    // var message = JSON.stringify(data);
    // youtubeEmbedWindow.postMessage(message, '*');
  }
  function handleGuess() {
    attemptDetails[count].value = input;
    moveBar();
    setInput('');
    if (input === answer) {
      alert("the answer is chaewon!");
    }
  }
  return (
    <div className="App" class="h-screen bg-[#1a2633]">
      <div class="text-center min-h-[10%]" >
        <Title />
      </div>
      <div className="Body" class="flex flex-col items-center space-y-4 min-h-[70%]">
        <Attempt attemptDetails={attemptDetails[0]}/>
        <Attempt attemptDetails={attemptDetails[1]}/>
        <Attempt attemptDetails={attemptDetails[2]}/>
        <Attempt attemptDetails={attemptDetails[3]}/>
        <Attempt attemptDetails={attemptDetails[4]}/>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/8UOEW3czU6U?si=j2ZM3BzR3v6MQZ5l&enablejsapi=1" title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen></iframe>
      </div>
      <div className="Game" class="flex flex-col items-center space-y-2">
        <GameBar duration={duration[count]} songBar={songBar} sectionColors={sectionColors}/>
        <PlayButton
                  duration={duration[count]}
                  setSliderDisabled={setSliderDisabled}
                  setSongBar={setSongBar}
                  startTime={startTime}
                />
        <div class="w-2/6 flex flex-row">
                <VolumeDown />
                <input type="range" class="w-full" min="0" max="100"
                  value={volume}
                  onInput={(e) => { setVolume(e.target.value) }}
                />
                <VolumeUp />
              </div>
              <Autocomplete
                userInput={input}
                setUserInput={setInput}
                suggestions={[
                  "Alligator",
                  "Bask",
                  "Crocodilian",
                  "Death Roll",
                  "Eggs",
                  "Jaws",
                  "Reptile",
                  "Solitary",
                  "Tail",
                  "Wetlands"
                ]}
              />
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
