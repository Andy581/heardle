import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { UnlimitedHeardle } from './pages/unlimitedHeardle';
import { DailyHeardle } from './pages/dailyHeardle';
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const root = ReactDOM.createRoot(document.getElementById('root'));
const firebaseConfig = {
    apiKey: `${process.env.REACT_APP_FIREBASE_API_KEY}`,
    authDomain: `${process.env.REACT_APP_AUTH_DOMAIN}`,
    projectId: `${process.env.REACT_APP_PROJECT_ID}`,
    storageBucket: `${process.env.REACT_APP_STORAGE_BUCKET}`,
    messagingSenderId: `${process.env.REACT_APP_MESSAGING_SENDER_ID}`,
    appId: `${process.env.REACT_APP_APP_ID}`,
    measurementId: `${process.env.REACT_APP_MEASUREMENT_ID}`
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const router = createBrowserRouter([
  {
    path: "/daily/:genre",
    element: <DailyHeardle db={db}/>,
  },
  {
    path: "unlimitedHeardle/:genre",
    element: <UnlimitedHeardle db={db}/>,
  }
])
root.render(
  // Remove Strict mode to let components render once (useEffect will render twice with strict mode)
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
