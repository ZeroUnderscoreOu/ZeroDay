// ==UserScript==
// @name        Steam Sticker Clicker
// @author      ZeroUnderscoreOu
// @version     1.1.0-beta
// @icon        
// @description 
// @namespace   https://github.com/ZeroUnderscoreOu/
// @match       *://steamcommunity.com/id/*/stickers*
// @match       *://steamcommunity.com/profiles/*/stickers*
// @connect     steamcommunity.com
// @connect     store.steampowered.com
// @grant       GM_xmlhttpRequest
// ==/UserScript==

"use strict";
var Tasks = [
	{
		Name: "Profile",
		URL: "http://steamcommunity.com/my/edit"
	},
	{
		Name: "Activity",
		URL: "http://steamcommunity.com/my/home"
	},
	{
		Name: "Screenshots",
		URL: "http://steamcommunity.com/my/screenshots"
	},
	{
		Name: "Broadcasts",
		URL: "http://steamcommunity.com/apps/allcontenthome?browsefilter=trend&appHubSubSection=13"
	},
	{
		Name: "Tags",
		URL: "http://store.steampowered.com/tag/browse"
	},
	{
		Name: "Videos",
		URL: "http://store.steampowered.com/videos"
	},
	{
		Name: "Queue",
		URL: "http://store.steampowered.com/explore"
	},
	{
		Name: "Preferences",
		URL: "http://store.steampowered.com/explore/discoveryqueuesettings/"
	}
];
var ProfileURL = window.eval("g_strProfileURL");
var SessionId = window.eval("g_sessionID");
var Container = document.querySelector("Div.sticker_button_container");
var Button = document.createElement("A");
Button.className = "btn_darkblue_white_innerfade btn_medium";
Button.style.display = "Inline-Block";
Button.addEventListener("click",GetFriend);
Button = Button.appendChild(document.createElement("Span"));
Button.style["min-width"] = "120px";
Button.style["text-align"] = "Center";
Button.textContent = "Stick";
Container.insertBefore(new Text(" "),Container.firstChild);
Container.insertBefore(Button.parentElement,Container.firstChild);

function XHRError(Message,Data) {
	console.error("SSC - %s\r\n%o",Message,Data);
};

function GetFriend() {
	GM_xmlhttpRequest({
		method: "Get",
		url: "http://steamcommunity.com/my/friends",
		timeout: 30 * 1000,
		onload: function(Data) {
			let SteamId = Data.responseText.match(/data-steamid="(\d+)"/);
			if (SteamId) {
				SteamId = "http://steamcommunity.com/profiles/" + SteamId[1];
				Tasks.push({
					Name: "Friend",
					URL: SteamId
				});
				console.log("SSC - friend",SteamId);
				CompleteTask();
			} else {
				console.log("SSC - no friends(");
			};
		},
		onerror: XHRError.bind(this,"friend error"),
		ontimeout: XHRError.bind(this,"friend timeout")
	});
};

function CompleteTask() {
	var Task = Tasks[0];
	if (!Task) {
		console.log("SSC - tasks completed");
		OpenPack();
		return;
	};
	GM_xmlhttpRequest({
		method: "Get",
		url: Task.URL,
		timeout: 30 * 1000,
		onload: function(Data) {
			let NewPack = Data.responseText.includes("NewStickerPackModal()");
			Button.textContent = Task.Name;
			if (!NewPack) {
				Tasks.shift();
			};
			setTimeout(CompleteTask,1000);
		},
		onerror: XHRError.bind(this,"task error"),
		ontimeout: XHRError.bind(this,"task timeout")
	});
};

function OpenPack() {
	GM_xmlhttpRequest({
		method: "Get",
		url: "http://steamcommunity.com/my/stickersopen/",
		timeout: 10 * 1000,
		onload: function(Data) {
			let Packs = JSON.parse(Data.responseText).stickerpacks;
			Button.textContent = "Packs " + Packs.toString(10);
			if (Packs>0) {
				setTimeout(OpenPack,500);
			} else {
				console.log("SSC - packs opened");
				FillPage(14);
			};
		},
		onerror: XHRError.bind(this,"pack error"),
		ontimeout: XHRError.bind(this,"pack timeout")
	});
};

function FillPage(Page) {
	if (Page<0) {
		console.log("SSC - pages filled");
		Button.textContent = "Done";
		return;
	};
	GM_xmlhttpRequest({
		method: "Post",
		url: ProfileURL + "/stickerscomplete/",
		data: "scene=" + Page.toString(10),
		headers: {
			"Content-Type": "Application/X-WWW-Form-URLEncoded"
		},
		timeout: 10 * 1000,
		onload: function(Data) {
			Button.textContent = "Page " + Page.toString(10);
			setTimeout(FillPage,1000,--Page);
		},
		onerror: XHRError.bind(this,"page error"),
		ontimeout: XHRError.bind(this,"page timeout")
	});
};