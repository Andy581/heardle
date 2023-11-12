import React from 'react';
import { useState } from 'react';

export default function Autocomplete({ suggestions, userInput, setUserInput, handleGuess, filteredSuggestions, setFilterSuggestions }) {
  const [activeSuggestion, setActiveSuggestion]  = useState(0);
  // const [filteredSuggestions, setFilterSuggestions] = useState([]);
  const [showSuggestion, setShowSuggestion] = useState(false);

  function handleOnChange(value) {
    setUserInput(value);
    var filteredSuggestions = suggestions.filter(
      suggestion => suggestion.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
    filteredSuggestions = filteredSuggestions.slice(0,7);
    setFilterSuggestions(filteredSuggestions);
    setShowSuggestion(true);
    setActiveSuggestion(0);
  }
  function handleOnClick(value) {
    setShowSuggestion(false);
    setFilterSuggestions([]);
    setUserInput(value);
    setActiveSuggestion(0);
  }
  function handleHover(value) {
    setActiveSuggestion(filteredSuggestions.indexOf(value));
  }
  function handleKeyDown(key) {
    if (key === 'ArrowUp') {
      if (activeSuggestion + 1  === filteredSuggestions.length) {
        return;
      }
      setActiveSuggestion(activeSuggestion+1);
    }
    else if (key === 'ArrowDown') {
      if (activeSuggestion === 0) {
        return;
      }
      setActiveSuggestion(activeSuggestion - 1);
    }
    else if (key === 'Enter') {
      if (filteredSuggestions.length === 0) {handleGuess();return;}
      setUserInput(filteredSuggestions[activeSuggestion]);
      setActiveSuggestion(0);
      setShowSuggestion(false);
      setFilterSuggestions([]);
    }

  }

  let suggestionsListComponent;

  if (showSuggestion && userInput) {
    if (filteredSuggestions.length) {
      suggestionsListComponent = (

        <ul class="-mt-48 h-48 max-[768px]:-mt-96 max-[768px]:h-96  max-h-screen flex flex-col-reverse items-center overflow-y-auto ">
          {filteredSuggestions.map((suggestion, index) => {

            return (
              <li style={{backgroundColor: index === activeSuggestion ? '#2d4358' : '#1a2633'}} class="w-full block border border-y-[#999999] text-zinc-50 "  
              onClick={e => handleOnClick(e.currentTarget.innerText)}
              onMouseOver={e => handleHover(e.target.innerText)}
              >
                {suggestion}
              </li>
            );
          })}
        </ul>
      );
    } else {
      suggestionsListComponent = (
        <ul class="overflow-auto -mt-32 h-32 flex flex-col-reverse items-center">
          <li class="w-full block border border-y-[#999999] bg-[#1a2633] text-white" >
            No Suggestions
          </li>
        </ul>
      )
    }
  }
  return (
    <div class="z-20 w-2/6 max-[768px]:w-screen border-2 border-solid border-[#afcbdd] my-32 ">
      {suggestionsListComponent}
      <svg class="absolute text-slate-400 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
      </svg>
      <input
        class="pl-10 w-full bg-[#1a2633] outline-none text-white"
        type="text"
        onChange={e => handleOnChange(e.target.value)}
        value={userInput}
        onKeyDown={e => handleKeyDown(e.key)}
      />
    </div>
  )
}