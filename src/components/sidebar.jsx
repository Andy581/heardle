import React from "react";
import { useState } from "react";
export function Sidebar() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [navWidth, setNavWidth] = useState("0");
    function toggleNav() {
        if (isNavOpen) {
            setNavWidth("250px")
        }
        else {
            setNavWidth("0")
        }
        setIsNavOpen(!isNavOpen);
    }
        return (
            <div class="flex flex-row z-10 ">
                <button type="submit" style={{ marginLeft: navWidth }} class="transition-all duration-50 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded " onClick={toggleNav}>
                    ☰
                </button>
                <div style={{ width: navWidth }} class="h-screen rounded-lg  fixed z-10 text-white  bg-[#121b2e] overflow-x-hidden pt-1 transition-all duration-50">
                    <ul>
                        <li>
                            Daily Heardle
                            <ul>
                                <li>
                                    <a href='/daily/kpop' class="pl-6">- kpop </a>
                                </li>
                                <li>
                                    <a href='/daily/taylorSwift' class="pl-6">- Taylor Swift </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            Unlimited Heardle
                            <ul>
                                <li>
                                    <a href='/unlimitedHeardle/kpop' class="pl-6">- kpop</a>
                                </li>
                                <li>
                                    <a href='/unlimitedHeardle/taylorSwift' class="pl-6">
                                        - Taylor Swift
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href='/customPlaylist'>Custom Playlist </a>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }