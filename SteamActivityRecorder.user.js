// ==UserScript==
// @name        Steam Activity Recorder
// @author      ZeroUnderscoreOu
// @version     1.1.0
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
		var FilterState = 0;
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
	Button = Div.appendChild(Button.cloneNode(true));
	Button.firstElementChild.textContent = "Erase";
	Button.addEventListener("click",Erase);
	Div = Div.insertBefore(document.createElement("Div"),Div.firstElementChild);
	Div.className = "profile_add_friends_title";
	Div.textContent = "Activity recorder";
	LaunchArea.insertBefore(Div.parentElement,LaunchArea.querySelector("Div.friends_add_block"));
};

function InitializeFriends() {
	var Manager = document.querySelector("Div.manage_actions_buttons");
	var Button = document.createElement("Span");
	var Style = document.createElement("Style");
	Button.className = "btnv6_lightblue_blue btn_medium";
	Button.appendChild(document.createElement("Span")).textContent = "Activity stats";
	Button.addEventListener("click",Display);
	Manager.appendChild(Button);
	//document.getElementById("manage_friends_btn").addEventListener("click",Clear);
	//Manager.querySelector("Span[onclick='ToggleManageFriends()']").addEventListener("click",Clear);
	Style.id = "SARStyle";
	document.head.appendChild(Style);
};

function Record() {
	var SARData = localStorage.getItem("SteamActivityRecorder");
	SARData
		? SARData = JSON.parse(SARData)
		: SARData = {
			Events: []
		};
	Array.from(document.querySelectorAll("Div.blotter_block")).forEach((Event)=>{
		let Link = Event.querySelector("[data-miniprofile]"); // event author profile link & Id; not always A
		let EventId = Event.querySelector("A[id^='vote_up'], A[id^='RecommendationVoteUp']"); // rate up button with event Id; players only
		if (Link&&EventId) {
			let AuthorId = Link.getAttribute("data-miniprofile");
			EventId = EventId.getAttribute("onclick");
			switch (true) {
				case EventId.includes("VoteUp("):
					EventId = EventId.match(/\d+/)[0];
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
			Br.parentElement.parentElement.classList.add("SARActive"); // for easier searching
		};
	});
	this.firstElementChild.textContent = "Show inactive";
	this.removeEventListener("click",Display);
	this.addEventListener("click",Filter);
};

function Filter() {
	var Style = document.getElementById("SARStyle");
	switch (FilterState) {
		case 0: // inactive
			this.firstElementChild.textContent = "Show active";
			Style.textContent = "Div.friendBlock.SARActive {Display: None;} Div.friendBlock:not(SARActive) {Display: Initial;}";
			FilterState++;
			break;
		case 1: // active
			this.firstElementChild.textContent = "Show all";
			Style.textContent = "Div.friendBlock.SARActive {Display: Initial;} Div.friendBlock:not(SARActive) {Display: None;}";
			FilterState++;
			break;
		case 2: // all
		default:
			this.firstElementChild.textContent = "Show inactive";
			Style.textContent = "Div.friendBlock.SARActive {Display: Initial;} Div.friendBlock:not(SARActive) {Display: Initial;}";
			FilterState = 0;
			break;
	};
	Array.from(document.querySelectorAll("Div.friendBlock.SARActive"));
};

function Clear() { // clearing displayed data
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