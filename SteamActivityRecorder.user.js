// ==UserScript==
// @name        Steam Activity Recorder
// @author      ZeroUnderscoreOu
// @version     1.0.0
// @icon        
// @description 
// @namespace   https://github.com/ZeroUnderscoreOu/
// @match       *://steamcommunity.com/id/*/home*
// @match       *://steamcommunity.com/profiles/*/home*
// @match       *://steamcommunity.com/id/*/friends*
// @match       *://steamcommunity.com/profiles/*/friends*
// @grant       none
// ==/UserScript==

switch (true) {
	case document.location.pathname.includes("/home"):
		InitializeHome();
		break;
	case document.location.pathname.includes("/friends"):
		InitializeFriends();
		break;
};

function InitializeHome() {
	var LaunchArea = document.querySelector("Div.friends_launch_area");
	var Div = document.createElement("Div");
	var Button = document.createElement("Div");
	Button.className = "btn_darkblue_white_innerfade btn_small_wide";
	Button.style.margin = "12px 12px 0px 0px";
	Button.appendChild(document.createElement("Span"));
	Div.className = "friends_add_block box";
	Button = Div.appendChild(Button.cloneNode(true));
	Button.firstElementChild.textContent = "Record";
	Button.addEventListener("click",Record);
	Button = Div.appendChild(Button.cloneNode(true))
	Button.firstElementChild.textContent = "Erase";
	Button.addEventListener("click",Erase);
	Div = Div.insertBefore(document.createElement("Div"),Div.firstElementChild);
	Div.className = "profile_add_friends_title";
	Div.textContent = "Activity recorder";
	LaunchArea.insertBefore(Div.parentElement,LaunchArea.querySelector("Div.friends_add_block"));
};

function InitializeFriends() {
	var Button = document.createElement("Span");
	Button.className = "btnv6_lightblue_blue btn_medium";
	Button.appendChild(document.createElement("Span")).textContent = "Activity stats";
	Button.addEventListener("click",Display);
	document.querySelector("Div.manage_actions_buttons").appendChild(Button);
	document.getElementById("manage_friends_btn").addEventListener("click",ManageClick);
};

function Record() {
	var SARData = localStorage.getItem("SteamActivityRecorder");
	SARData
		? SARData = JSON.parse(SARData)
		: SARData = {
			Events: []
		};
	Array.from(document.querySelectorAll("Div.blotter_block")).forEach((Event)=>{
		let Link = Event.querySelector("A[data-miniprofile]"); // event author profile link & Id
		let EventId = Event.querySelector("A[Id^='vote_up']"); // rate up button with event Id; players only
		if (Link&&EventId) {
			let AuthorId = Link.getAttribute("data-miniprofile");
			EventId = EventId.getAttribute("onclick");
			switch (true) {
				case EventId.includes("VoteUp("):
					EventId = EventId.match(/\((\d+)\)/)[1];
					break;
				case EventId.includes("VoteUpCommentThread("):
					EventId = EventId.split("_")[2];
					break;
				default:
					ShowDialog("Steam Activity Recorder","Error parsing EventId, report this\r\n"+EventId);
					break;
			};
			if (!SARData.Events.includes(EventId)) { // if new event
				SARData.Events.push(EventId); // record it
				SARData[AuthorId] ? SARData[AuthorId]++ : SARData[AuthorId] = 1; // and count it
			};
		};
	});	
	localStorage.setItem("SteamActivityRecorder",JSON.stringify(SARData));
};

function Erase() {
	localStorage.removeItem("SteamActivityRecorder");
};

function Display() {
	var SARData = localStorage.getItem("SteamActivityRecorder");
	SARData
		? SARData = JSON.parse(SARData)
		: SARData = {};
	Object.keys(SARData).forEach((Key)=>{
		let Selector = `Div[data-miniprofile='${Key}'] Br`;
		let Br = document.querySelector(Selector);
		if (Br) {
			let Span = document.createElement("Span");
			Span.className = "SARData"; // for easier searching
			Span.appendChild(document.createElement("Sup")).textContent = ` [${SARData[Key]}]`;
			Br.parentElement.insertBefore(Span,Br);
		};
	});
};

function ManageClick() { // clearing displayed data
	Array.from(document.querySelectorAll("Span.SARData")).forEach((Span)=>{
		Span.parentElement.removeChild(Span);
	});
};



/*
'<Div Class="profile_link_block box">'
	+ '<Div Class="profile_add_friends_title">Activity recorder</Div>'
	+ '<Div Class="btn_darkblue_white_innerfade btn_small_wide" Style="Margin: 12px 12px 0px 0px">'
		+ '<Span>Record</Span>'
	+ '</Div>'
	+ '<Div Class="btn_darkblue_white_innerfade btn_small_wide">'
		+ '<Span>Erase</Span>'
	+ '</Div>'
+ '</Div>';
*/