import './App.css';
import { Sidebar } from './components/sidebar';

// Gonna move all this crap when we have different pages
function App() {
  return (
    <div className="App" class="h-screen bg-[#1e293b] ">
        <Sidebar/>
        <div class="min-h-[90%] bg-[#1e293b] flex flex-col justify-center items-center text-white space-y-8">
        <h1 class="text-6xl"> Welcome to Youtube Heardle! </h1>
        <p class="mx-96"> Hey! I started building this website as a fun project, but later decided to publish it for the public. This website is still in development as I am still working on more features, but I am a college student so it might take some time. However I hope you will still be able to enjoy playing! </p>
        <p>Click on the hamburger icon to get started! </p>
        </div>
    </div>
  );
}

export default App;
