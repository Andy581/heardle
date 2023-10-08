import { useEffect } from 'react';
import './App.css';
import { Sidebar } from './components/sidebar';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';
import { setDoc, doc } from 'firebase/firestore';

// Gonna move all this crap when we have different pages
function App({ db }) {
  const [cookies, setCookies] = useCookies(['user'])
  return (
    <div className="App" class="h-screen bg-[#1e293b] ">
      <Sidebar />
      <div class="min-h-[90%] bg-[#1e293b] flex flex-col justify-center items-center text-white space-y-8">
        <h1 class="text-6xl"> Welcome to YouTube Heardle! </h1>
        <p class="mx-96 sm:mx-4"> Hey! My name is Andy and I started building this website as a fun project, but later decided to publish it for the public. Hope you enjoy! </p>
        <p>Click on the hamburger icon (top left) to get started! </p>
      </div>
    </div>
  );
}

export default App;
