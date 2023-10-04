import { useEffect } from 'react';
import './App.css';
import { Sidebar } from './components/sidebar';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';
import { setDoc, doc } from 'firebase/firestore';

// Gonna move all this crap when we have different pages
function App({ db }) {
  const [cookies, setCookies] = useCookies(['user'])
  useEffect(() => {
    const checkUUID = async () => {
      if (!cookies.uuid) {
        const uuid = uuidv4();
        setCookies('uuid', uuid, { expires: new Date(new Date().setFullYear(2024)), path: '/' })
        const docRef = doc(db, "users", uuid);
        await setDoc(docRef, { uuid: uuid })
      }
    }
    checkUUID();
  }, [])
  return (
    <div className="App" class="h-screen bg-[#1e293b] ">
      <Sidebar />
      <div class="min-h-[90%] bg-[#1e293b] flex flex-col justify-center items-center text-white space-y-8">
        <h1 class="text-6xl"> Welcome to Youtube Heardle! </h1>
        <p class="mx-96"> Hey! My name is Andy and I started building this website as a fun project, but later decided to publish it for the public. This website is still in development as I am still working on more some features, but I am a college student so it might take some time. However I hope you will still be able to enjoy playing! </p>
        <p>Click on the hamburger icon to get started! </p>
      </div>
    </div>
  );
}

export default App;
