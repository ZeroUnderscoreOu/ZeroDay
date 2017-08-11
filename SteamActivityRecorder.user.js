// ==UserScript==
// @name        Steam Activity Recorder
// @author      ZeroUnderscoreOu
// @version     1.2.0
// @icon        
// @description 
// @namespace   https://github.com/ZeroUnderscoreOu/
// @match       *://steamcommunity.com/id/*/home*
// @match       *://steamcommunity.com/id/*/friends*
// @match       *://steamcommunity.com/profiles/*/home*
// @match       *://steamcommunity.com/profiles/*/friends*
// @match       *://steamcommunity.com/groups/*
// @grant       none
// ==/UserScript==

var FilterState = 0; // friends filter
var Responder = {
	onComplete: (AjaxData,XHRData) => {
		// XHRData.responseText // proper way would be to store response as I see it anyway and then parse it if needed, but I'm too lazy to code it ATM
		if (AjaxData.url.includes("?friends=1")) { // list of friends in group
			InitializeGroups();
		};
	}
};
var SARData = localStorage.getItem("SteamActivityRecorder");
SARData
	? SARData = JSON.parse(SARData)
	: SARData = {
		Events: [],
		Groups: {},
		Friends: {}
	};

switch (true) {
	case document.location.pathname.includes("/home"):
		InitializeHome();
		break;
	case document.location.pathname.includes("/groups"):
		Ajax.Responders.register(Responder);
		break;
	case document.location.pathname.includes("/friends"):
		InitializeFriends();
		break;
};

function InitializeHome() {
	var LaunchArea = document.querySelector("Div.friends_launch_area");
	var Div = document.createElement("Div");
	var Button = document.createElement("Div");
	Div.className = "friends_add_block box";
	Div.appendChild(Button);
	Button.className = "btn_darkblue_white_innerfade btn_small_wide";
	Button.style.margin = "12px 12px 0px 0px";
	Button.appendChild(document.createElement("Span")).textContent = "Record";
	Button.addEventListener("click",RecordActivity);
	Button = Div.appendChild(Button.cloneNode(true));
	Button.firstElementChild.textContent = "Erase";
	Button.addEventListener("click",EraseActivity);
	Div = Div.insertBefore(document.createElement("Div"),Div.firstElementChild);
	Div.className = "profile_add_friends_title";
	Div.textContent = "Activity recorder";
	LaunchArea.insertBefore(Div.parentElement,LaunchArea.querySelector("Div.friends_add_block"));
};

function InitializeGroups() {
	var LeftColumn = document.querySelector("#group_page_dynamic_content Div.leftcol");
	var Button = document.createElement("Div");
	LeftColumn.appendChild(Button);
	Button.className = "btn_darkblue_white_innerfade btn_small_wide";
	Button.style["margin-right"] = "9px";
	Button.appendChild(document.createElement("Span")).textContent = "Record";
	Button.addEventListener("click",RecordGroup);
	Button = LeftColumn.appendChild(Button.cloneNode(true));
	Button.firstElementChild.textContent = "Erase";
	Button.addEventListener("click",EraseGroup);
};

function InitializeFriends() {
	var Manager = document.querySelector("Div.manage_actions_buttons");
	var Button = document.createElement("Span");
	Button.className = "btnv6_lightblue_blue btn_medium";
	Button.appendChild(document.createElement("Span")).textContent = "Activity stats";
	Button.addEventListener("click",Display);
	Manager.appendChild(Button);
	//document.getElementById("manage_friends_btn").addEventListener("click",Clear);
	//Manager.querySelector("Span[onclick='ToggleManageFriends()']").addEventListener("click",Clear);
	document.head.appendChild(document.createElement("Style")).id = "SARFilter";
	document.head.appendChild(document.createElement("Style")).textContent = "Span.SARGroup, Span.SARActivity {Opacity: 0.75; Font-Style: Italic;}";
};

function RecordActivity() {
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
				SARData.Friends[AuthorId] ? SARData.Friends[AuthorId]++ : SARData.Friends[AuthorId] = 1; // and count it
			};
		};
	});
	localStorage.setItem("SteamActivityRecorder",JSON.stringify(SARData));
};

function EraseActivity() {
	localStorage.removeItem("SteamActivityRecorder");
};

function RecordGroup(Event,Page=1,Ids=[]) { // counter
	var Link = document.location.origin + document.location.pathname + `/members?friends=1&p=${Page}&content_only=true`;
	var GroupId = document.querySelector("Span.grouppage_header_abbrev").textContent; // abbreviation; should I escape it?
	// document.querySelector("Input[name='groupId']").value; // Id
	if (!GroupId) {
		alert("Steam Activity Recorder - wrong group Id\r\n"+GroupId);
	};
	fetch(Link,{credentials:"same-origin"}).then((Data)=>(Data.text())).then((Data)=>{ // I'm refetching what's already there, but it's easier to code
		let NextPage = Data.includes(`?friends=1&p=${++Page}`); // link to the next page
		Ids = Ids.concat(Data.match(/data-miniprofile="\d+"/g));
		if (NextPage) { // checking if there's a link
			RecordGroup(null,Page,Ids); // loading next page
		} else { // parsing & recording Ids
			SARData.Groups[GroupId] = Ids.map((Id)=>(Id.match(/\d+/)[0]));
			localStorage.setItem("SteamActivityRecorder",JSON.stringify(SARData));
		};
	});
};

function EraseGroup() {
	var GroupId = document.querySelector("Span.grouppage_header_abbrev").textContent; // abbreviation
	if (!GroupId) {
		alert("Steam Activity Recorder - wrong group Id\r\n"+GroupId);
	};
	delete(SARData.Groups[GroupId]);
	localStorage.setItem("SteamActivityRecorder",JSON.stringify(SARData));
};

function Display() {
	Object.keys(SARData.Friends).forEach((Friend)=>{
		let Selector = `Div[data-miniprofile='${Friend}'] Br`;
		let Br = document.querySelector(Selector);
		if (Br) {
			let Span = document.createElement("Span");
			Span.className = "SARActivity"; // for easier searching
			Span.textContent = ` [${SARData.Friends[Friend]}]`;
			Br.parentElement.insertBefore(Span,Br);
			Br.parentElement.parentElement.classList.add("SARActive"); // for easier searching
		};
	});
	Object.keys(SARData.Groups).forEach((Group)=>{
		SARData.Groups[Group].forEach((Friend)=>{
			let Selector = `Div[data-miniprofile='${Friend}'] Br`;
			let Br = document.querySelector(Selector);
			if (Br) {
				let Span = document.createElement("Span");
				Span.className = "SARGroup"; // for easier searching
				Span.textContent = ` ${Group}`;
				Br.parentElement.insertBefore(Span,Br);
			};
		});
	});
	this.firstElementChild.textContent = "Show inactive";
	this.removeEventListener("click",Display);
	this.addEventListener("click",Filter);
};

function Filter() {
	var Style = document.getElementById("SARFilter");
	switch (FilterState) {
		case 0: // inactive
			this.firstElementChild.textContent = "Show active";
			//Style.textContent = "Div.friendBlock.SARActive {Display: None;} Div.friendBlock:not(SARActive) {Display: Initial;}";
			Style.textContent = "Div.friendBlock.SARActive {Visibility: Hidden;} Div.friendBlock:not(SARActive) {Visibility: Initial;}";
			FilterState++;
			break;
		case 1: // active
			this.firstElementChild.textContent = "Show all";
			//Style.textContent = "Div.friendBlock.SARActive {Display: Initial;} Div.friendBlock:not(SARActive) {Display: None;}";
			Style.textContent = "Div.friendBlock.SARActive {Visibility: Initial;} Div.friendBlock:not(SARActive) {Visibility: Hidden;}";
			FilterState++;
			break;
		case 2: // all
		default:
			this.firstElementChild.textContent = "Show inactive";
			//Style.textContent = "Div.friendBlock.SARActive {Display: Initial;} Div.friendBlock:not(SARActive) {Display: Initial;}";
			Style.textContent = "Div.friendBlock.SARActive {Visibility: Initial;} Div.friendBlock:not(SARActive) {Visibility: Initial;}";
			FilterState = 0;
			break;
	};
	Array.from(document.querySelectorAll("Div.friendBlock.SARActive"));
};

function Clear() { // clearing displayed data
	Array.from(document.querySelectorAll("Span.SARActivity, Span.SARGroup")).forEach((Span)=>{
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