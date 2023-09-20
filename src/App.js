import logo from './logo.svg';
import './App.css';
import Attempt from './components/attempt';
import Title from './components/title';
import { useRef, useState } from 'react';

function App() {
  const [attempts, setAttempts] = useState(['', '', '', '', '']);
  const [input, setInput] = useState('');
  const [width, setWidth] = useState(0);
  const progressBar = useRef(null);
  const answer = "chaewon";
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
    let bar = document.getElementById('bar');
    if (bar.classList.contains(`w-${width}/16`)) {
      console.log("its there!");
    }
    progressBar.current.classList.remove(`w-${width}/16`);
    // bar.classList.remove(`w-${width}/16`);
    if (bar.classList.contains(`w-${width}/16`)) {
      console.log("its there!");
    }
    progressBar.current.classList.add(`w-${width+1}/16`);
    // bar.classList.add(`w-${width+1}/16`);
    if (bar.classList.contains(`w-${width+1}/16`)) {
      console.log("its there! part 2!");
    }
    setWidth(width+1);
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
      </div>
      <div className="Game" class="flex flex-col items-center space-y-2">
        <div className="Bar" class="w-full border h-5">
          <div ref={progressBar} id="bar"  style={{width: width/16.0 * 100 + '%'}}class="bg-blue-600 h-6 rounded-full transition-all ease-out duration-1000" >

          </div>
          <div className="ProgressBar" class="-my-6 grid grid-cols-16 divide-x-6">
            <div className="Section" class="border-r-2 border-rose-500"> 01</div>
            <div className="Section" class="border-r-2 border-rose-500"> 02</div>
            <div className="Section" class="border-r-2 border-rose-500 col-span-2"> 03</div>
            <div className="Section" class="border-r-2 border-rose-500 col-span-3"> 04</div>
            <div className="Section" class="border-r-2 border-rose-500 col-span-4"> 05</div>
            <div className="Section" class="border-r-2 border-rose-500 col-span-5"> 06</div>
          </div>
        </div>
        <button type="button">
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
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Skip (1s)
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
