import React, { useState } from "react";
import { Sidebar } from "../components/sidebar";
import Title from "../components/title";

export function CustomPlaylist({ db }) {
    const [playlistLink, setPlaylistLink] = useState('');
    const [hidden, setHidden] = useState(true);
    function handleToggle() {
        setHidden(!hidden);
    }
    return (
        <div class="h-screen bg-[#1e293b]">
            <Sidebar />
            <div>
                <Title />
            </div>
            <div className="Body bg-[#1e293b]" >
                <button type ="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-25 disabled:bg-blue-500" onClick = {handleToggle}>
                    Toggle modal
                </button>
                <div style={{ display: hidden ? "none" : "" }} aria-hidden="true" class="flex flex-col justify-center items-center fixed z-50 w-full p-4  overflow-x-hidden overflow-y-auto h-[calc(100%-1rem)] ">
                    <div class="relative w-full max-w-2xl max-h-full">
                        {/* <!-- Modal content --> */}
                        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            {/* <!-- Modal header --> */}
                            <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                                    Custom Playlist
                                </h3>
                                
                            </div>
                            {/* <!-- Modal body --> */}
                            <div class="p-6 space-y-6">
                            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Public Playlist URL</label>
                            <input type="url" name="password" placeholder="https://www.youtube.com/playlist?list=PLOHoVaTp8R7dfrJW5pumS0iD_dhlXKv17" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" ></input>
                                
                            </div>
                            {/* <!-- Modal footer --> */}
                            <div class="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                                <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"> Submit </button>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}