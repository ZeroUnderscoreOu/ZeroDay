// ==UserScript==
// @name        Steam Sticker Clicker
// @author      ZeroUnderscoreOu
// @version     1.0.0-beta
// @icon        
// @description 
// @namespace   https://github.com/ZeroUnderscoreOu/
// @match       *://steamcommunity.com/*/stickers
// @grant       GM_xmlhttpRequest
// ==/UserScript==

var Links = [
	"http://steamcommunity.com/my/edit",
	"http://steamcommunity.com/my/friends",
	"http://steamcommunity.com/my/home",
	"http://steamcommunity.com/my/screenshots",
	//"http://steamcommunity.com/?subsection=broadcasts",
	"http://steamcommunity.com/apps/allcontenthome?browsefilter=trend&appHubSubSection=13",
	"http://store.steampowered.com/tag/browse",
	"http://store.steampowered.com/videos",
	"http://store.steampowered.com/explore"
];
var CompleteURL = document.location.href.split("/stickers")[0] + "/stickerscomplete/"
var Container = document.querySelector("Div.sticker_button_container");
var Button = document.createElement("A");
Button.className = "btn_darkblue_white_innerfade btn_medium";
Button.style.display = "Inline-Block";
Button.addEventListener("click",CompleteTask);
Button.appendChild(document.createElement("Span")).textContent = "Click!!1";
Container.insertBefore(new Text(" "),Container.firstChild);
Container.insertBefore(Button,Container.firstChild);

function CompleteTask() {
	var Address = Links[0];
	if (!Address) {
		console.log("SSC - tasks completed");
		OpenPack();
		return;
	};
	GM_xmlhttpRequest({
		method: "Get",
		url: Address,
		timeout: 30 * 1000,
		onload: function(Data) {
			let NewPack = Data.responseText.includes("NewStickerPackModal()");
			console.log("SSC - tasks",NewPack,Address);
			if (!NewPack) {
				Links.shift();
			};
			setTimeout(CompleteTask,1000);
		},
		onerror: function(Data) {
			console.error("SSC - task error",Data);
		},
		ontimeout: function(Data) {
			console.error("SSC - task timeout",Data);
		}
	});
};

function OpenPack() {
	GM_xmlhttpRequest({
		method: "Get",
		url: "http://steamcommunity.com/my/stickersopen/",
		timeout: 10 * 1000,
		onload: function(Data) {
			let Packs = parseInt(Data.responseText.match(/"stickerpacks":(\w+)/)[1]);
			console.log("SSC - packs",Packs);
			if (Packs>0) {
				setTimeout(OpenPack,500);
			} else {
				console.log("SSC - packs opened");
				FillPage(14);
			};
		},
		onerror: function(Data) {
			console.error("SSC - pack error",Data);
		},
		ontimeout: function(Data) {
			console.error("SSC - pack timeout",Data);
		}
	});
};

function FillPage(Page) {
	if (Page<0) {
		console.log("SSC - pages filled");
		return;
	};
	GM_xmlhttpRequest({
		method: "Post",
		url: CompleteURL,
		data: "scene=" + Page.toString(10),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		timeout: 10 * 1000,
		onload: function(Data) {
			console.log("SSC - page",Page);
			setTimeout(FillPage,1000,--Page);
		},
		onerror: function(Data) {
			console.error("SSC - page error",Data);
		},
		ontimeout: function(Data) {
			console.error("SSC - page timeout",Data);
		}
	});
};



/// ^ update
function CompleteTask() {
	var Address = Links[0];
	if (!Address) {
		console.log("Completed");
		return;
	};
	fetch(Address,{credentials:"include"})
		.then((Data)=>(Data.text()))
		.then((Data)=>{
			let NewPack = Data.includes("NewStickerPackModal()");
			console.log("Stick",NewPack,Address);
			if (NewPack) {
				CompleteTask(Address);
			} else {
				CompleteTask(Links.shift());
			};
		})
		.catch((Error)=>{console.error(Error)});
};



document.querySelectorAll("#tasks_remaining_container Div.task")

https://steamcommunity.com/id/ZeroUnderscoreOu/stickersopen/

Add to your wishlist http://steamcommunity.com/my/wishlist
Mark something Not Interested
Follow a Curator