import React from "react";
import { useRef, useEffect, useState } from "react";
export default function Countdown() {
    const Ref = useRef(null);
 
    // The state for our timer
    const [timer, setTimer] = useState('00:00:00');
 
    const getTimeRemaining = (tmr) => {
        const total = tmr - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 / 60 / 60) % 24);
        return {
            total, hours, minutes, seconds
        };
    }
 
    const startTimer = (e) => {
        let { total, hours, minutes, seconds }
                    = getTimeRemaining(e);
        if (total >= 0) {
 
            // update the timer
            // check if less than 10 then we need to
            // add '0' at the beginning of the variable
            setTimer(
                (hours > 9 ? hours : '0' + hours) + ':' +
                (minutes > 9 ? minutes : '0' + minutes) + ':'
                + (seconds > 9 ? seconds : '0' + seconds)
            )
        }
    }
 
    const clearTimer = (e) => {
        // If you try to remove this line the
        // updating of timer Variable will be
        // after 1000ms or 1sec
        if (Ref.current) clearInterval(Ref.current);
        const id = setInterval(() => {
            startTimer(e);
        }, 1000)
        Ref.current = id;
    }
 
    const getDeadTime = () => {
 
        // This is where you need to adjust if
        // you entend to add more time
        var today = new Date();
        var tomorrow = new Date(today.getFullYear(), today.getMonth(), (new Date(new Date().getTime() + 24 * 60 * 60 * 1000)).getDate());
        return tomorrow;
    }
 
    // We can use useEffect so that when the component
    // mount the timer will start as soon as possible
 
    // We put empty array to act as componentDid
    // mount only
    useEffect(() => {
        clearTimer(getDeadTime());
    }, []);
 
 
    return (
        <div >
            <h2 class="text-white">{timer}</h2>
        </div>
    )
}