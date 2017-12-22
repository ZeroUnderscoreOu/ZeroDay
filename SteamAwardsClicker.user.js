// ==UserScript==
// @name        Steam Awards Clicker
// @author      ZeroUnderscoreOu
// @version     1.0.0
// @icon        
// @description 
// @namespace   https://github.com/ZeroUnderscoreOu/
// @match       http://store.steampowered.com/SteamAwards/
// @run-at      document-idle
// @grant       none
// ==/UserScript==

// making a random vote out of all present
let Nominations = document.querySelectorAll("Div.vote_nomination Div.btn_vote");
let Vote = Math.floor(Math.random()*Nominations.length);
Nominations[Vote].click();