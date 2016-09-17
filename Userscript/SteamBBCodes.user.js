// ==UserScript==
// @name        Steam BBCodes
// @author      ZeroUnderscoreOu
// @version     1.2.0
// @icon        https://raw.githubusercontent.com/ZeroUnderscoreOu/SteamBBCodes/master/Logo128.png
// @description Steam BBCodes editor
// @namespace   https://github.com/ZeroUnderscoreOu/
// @include     /^https?:\/\/steamcommunity.com\/(id|profiles|sharedfiles|groups|discussions|app)\/.*/
// @exclude     /^https?:\/\/steamcommunity.com\/sharedfiles\/editguidesubsection\/.*/
// @exclude     /^https?:\/\/steamcommunity.com\/groups\/.*?\/(eventEdit|events|announcements\/hidden)$/
// @match       *://store.steampowered.com/app/*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_getResourceText
// @require     https://raw.githubusercontent.com/ZeroUnderscoreOu/ZeroDay/master/Beholder.js
// @resource    SteamBBCodes https://raw.githubusercontent.com/ZeroUnderscoreOu/ZeroDay/master/SteamBBCodes.js
// ==/UserScript==

var Userscript = document.createElement("Script");
Userscript.type = "Text/JavaScript";
Userscript.textContent = GM_getResourceText("SteamBBCodes");
document.head.appendChild(Userscript);