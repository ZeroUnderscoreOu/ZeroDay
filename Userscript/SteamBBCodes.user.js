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
// @run-at      document-end
// @grant       none
// @require     https://raw.githubusercontent.com/ZeroUnderscoreOu/ZeroDay/master/SteamBBCodes.js
// ==/UserScript==

// little easteregg
function SteamBBCodesBeholder(HeSeesUs) {
	if (typeof(HeSeesUs)=="boolean") {
		GM_setValue("Beholder",HeSeesUs);
	};
	return !!GM_getValue("Beholder"); // returning eye state
};
if (GM_getValue("Beholder")==undefined&&document.getElementById("account_pulldown").textContent.toLocaleUpperCase().includes("BEHOLDER")) {
	 GM_setValue("Beholder","ICU");
};
window.eval("var SteamBBCodesBeholder = " + SteamBBCodesBeholder.toString());