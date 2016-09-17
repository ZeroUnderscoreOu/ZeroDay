/*
Steam BBCodes userscript 1.2.0
Written by ZeroUnderscoreOu
http://steamcommunity.com/id/ZeroUnderscoreOu/
http://steamcommunity.com/groups/0_oWassup/discussions/4/
https://github.com/ZeroUnderscoreOu/SteamBBCodes
*/

//document.getElementsByClassName("forumtopic_reply_textarea")[0]; // forum
//document.getElementsByClassName("commentthread_textarea")[0]; // comment
//document.getElementsByClassName("input_box")[0]; // review

/* ToDO
(возможно) переписать создание кнопок полностью динамически, без клонирования; создавать ButtonContainer динамически; придумать, как передавать стили для него
! не забыть заменить ZeroDay
*/

var SteamBBCodes = {};

var TextArea;
var TagList = { // available tags
	B: {
		Title: "Bold",
		Offset: (-16 * 0).toString(10) + "px 0px",
		Extended: false
	},
	I: {
		Title: "Italics",
		Offset: (-16 * 1).toString(10) + "px 0px",
		Extended: false
	},
	U: {
		Title: "Underline",
		Offset: (-16 * 2).toString(10) + "px 0px",
		Extended: false
	},
	Strike: {
		Title: "Strikethrough",
		Offset: (-16 * 3).toString(10) + "px 0px",
		Extended: false
	},
	URL: {
		Title: "URL",
		Offset: (-16 * 4).toString(10) + "px 0px",
		Extended: false
	},
	Spoiler: {
		Title: SteamBBCodes.HeSeesUs
			? "BEHOLDER/r/nSEE the console."
			: "Spoiler",
		Offset: SteamBBCodes.HeSeesUs
			? (-16 * 13).toString(10) + "px 0px"
			: (-16 * 5).toString(10) + "px 0px",
		Extended: false
	},
	H1: {
		Title: "Header",
		Offset: (-16 * 6).toString(10) + "px 0px",
		Extended: true
	},
	Quote: {
		Title: "Quote",
		Offset: (-16 * 7).toString(10) + "px 0px",
		Extended: true
	},
	Code: {
		Title: "Code",
		Offset: (-16 * 8).toString(10) + "px 0px",
		Extended: true
	},
	NoParse: {
		Title: "NoParse",
		Offset: (-16 * 9).toString(10) + "px 0px",
		Extended: false
	},
	OList: {
		Title: "Ordered list",
		Offset: (-16 * 10).toString(10) + "px 0px",
		Extended: true
	},
	List: {
		Title: "Unordered list",
		Offset: (-16 * 11).toString(10) + "px 0px",
		Extended: true
	},
	Table: {
		Title: "Table",
		Offset: (-16 * 12).toString(10) + "px 0px",
		Extended: true
	}
};
var Responder = { // should keep an eye on unintentionally doubling buttons
	onComplete: function(AjaxData,XHRData) {
		if (XHRData.responseJSON&&XHRData.responseJSON.comments_html) { // assuming comments' refresh either by edit or new page
			TextAreaInitialization();
			InsertionPoint = document.getElementsByClassName("commentthread_edit_buttons");
			InsertButtons(InsertionPoint,"0px","22px",BBFull);
			DiscussionsButtonFixer();
		};
	}
};
var ButtonContainer = document.createElement("Div"); // buttons' container;
var ButtonBase = document.createElement("Button"); // button template;
var ButtonStyle = document.createElement("Style");
var TriggerCheck = false; // check for rules' triggering
var BBFull = true; // booleans for clearer calls of InsertButtons()
var BBLimited = false;
ButtonStyle.type = "Text/CSS";
ButtonStyle.textContent = ".BBCodeContainer {Position: Relative; Float: Left;}"
	+ "Button.BBCodeButton {Margin-Right: 4px; Vertical-Align: Middle;}"
	+ "Button.BBCodeButton .ico16 {Width: 16px; Height: 16px; Vertical-Align: Middle; Background-Image: URL(https://raw.githubusercontent.com/ZeroUnderscoreOu/ZeroDay/master/BackgroundIcons.png);}";
ButtonContainer.className = "BBCodeContainer";
ButtonBase.type = "Button";
ButtonBase.className = "btn_grey_black BBCodeButton";
ButtonBase = ButtonBase.appendChild(document.createElement("Img"));
ButtonBase.className = "ico16";
ButtonBase = ButtonBase.parentElement;
//ButtonContainer.style["vertical-align"] = "Middle";

function BBCodesInitialization() {
	var TempElem;
	var TextAreas = document.body.getElementsByTagName("TextArea");
	if (TextAreas.length>0) { // if there is a textarea, probably it's for comments
		document.head.appendChild(ButtonStyle);
		TextAreaInitialization();
		Ajax.Responders.register(Responder); // reinserting buttons in case of comment reloading - new post/edited post/new page
		InsertionInitialization();
	};
};

function TextAreaInitialization() {
	var TextAreas = document.body.getElementsByTagName("TextArea");
	if (TextAreas.length>0) { // if there is a textarea, probably it's for comments
		for (let A=0;A<TextAreas.length;A++) {
			TextAreas[A].addEventListener(
				"focus",
				function(){TextArea=this},
				false
			);
		};
	} else {
		alert("No textareas on "+document.location.href); //console.log
	};
};

function InsertionInitialization() { // I don't make additional check for if any elements were found because it would be just a cycle with 0 iterations in InsertButtons() if not
	var InsertionPoint = document.getElementsByClassName("commentthread_entry_submitlink"); // has different offset and tag support depending on page
	console.log("Check\r\n",InsertionPoint);
	switch (!!document.location.href) { // needs to be true
		case document.location.href.includes("/home"): // new status, new comment in activity; trailing slash omitted just in case; no break for the next case
			console.log("Point",1);
			InsertionPoint = document.getElementsByClassName("blotter_status_submit_ctn");
			InsertButtons(InsertionPoint,"40px","24px",BBLimited);
		case document.location.href.includes("/status/"): // new comment in status
		case document.location.href.includes("/friendactivitydetail/"): // new comment in purchase
			console.log("Point",2);
			InsertButtons(InsertionPoint,"50px","22px",BBLimited);
			break;
		case document.location.href.includes("/recommended/"): // review edit, new comment in review; no break
			console.log("Point",3);
			InsertionPoint = document.getElementById("ReviewEdit");
			InsertButtons([InsertionPoint],"0px","22px",BBFull,"insertBefore",document.getElementById("ReviewEditTextArea").nextSibling);
			//if (InsertionPoint) {};
		case !!document.location.href.match(/\/(id|profiles|groups)\/[^\/]*\/?$/): // new comment in profile/group
		case document.location.href.includes("/filedetails/"): // new comment in screenshot/artwork/Workshop/Greenlight
		case document.location.href.includes("announcements/detail/"): // new comment in announcement of a group/game
		case document.location.href.includes("/news/"): // new comment in news; Store & Community has separate news
		case document.location.href.includes("events/"): // new comment in group event
			//document.location.href.search(/\/games\/\d*\/announcements\/detail\//) should be no longer needed
			console.log("Point",4);
			InsertButtons(InsertionPoint,"44px","22px",BBLimited);
			break;
		case document.location.href.includes("/discussions/"): // new comment on forum; no break
			console.log("Point",5);
			InsertButtons(InsertionPoint,"44px","22px",BBFull);
		case document.location.href.includes("/discussions"): // new topic, topic edit; comment edit; trailing slash omitted to work with group forum index
			console.log("Point",6);
			InsertionPoint = document.getElementsByClassName("forum_newtopic_action"); // "forum_newtopic_textcontrols" forum_newtopic_area forum_newtopic_box
			InsertButtons(InsertionPoint,"44px","22px",BBFull);
			InsertionPoint = document.getElementsByClassName("commentthread_edit_buttons");
			InsertButtons(InsertionPoint,"0px","22px",BBFull);
			DiscussionsButtonFixer();
			break;
		case document.location.href.includes("store.steampowered.com/app/"): // new review
			console.log("Point",7);
			ButtonContainer.style.float = "none"; // prventing siblings from being on the same line
			ButtonContainer.style["margin-bottom"] = "9px";
			//InsertionPoint = document.getElementsByClassName("review_controls_right")[0];
			InsertionPoint = document.getElementsByClassName("review_controls")[0];
			InsertButtons([InsertionPoint],"0px","22px",BBFull); // passing 1 element as an array to enable length property; doesn't have suitable block for buttons, passing like this to remove additional checks
			//if (InsertionPoint) {};
			break;
		case !!document.location.href.match(/\/announcements\/(create|edit)/): // new group announcement
			console.log("Point",8);
			InsertionPoint = document.getElementsByClassName("btn_grey_black btn_small_thin")[0]; // "Formatting help" button
			InsertButtons([InsertionPoint.parentElement],"0px","22px",BBFull); // has a suitable block, but it doesn't have unique handles
			//if (InsertionPoint&&document.location.href.includes("")) {};
			break;
		case !!document.location.href.match(/\/edit(\/profile)?$/): // user/group profile edit
			console.log("Point",9);
			InsertionPoint = document.getElementsByClassName("btn_grey_black btn_small_thin")[0];
			InsertButtons([InsertionPoint.parentElement],"0px","22px",BBLimited);
			break;
		case document.location.href.includes("/itemedittext/"): // screenshot/artwork/workshop edit
			console.log("Point",10);
			ButtonContainer.style["margin-top"] = "5px";
			InsertionPoint = document.getElementById("ItemEditText");
			InsertButtons([InsertionPoint],"158px","22px",BBFull,"insertBefore",InsertionPoint.getElementsByClassName("btn_green_white_innerfade btn_medium")[0]); // I already use insertBefore, MB refactor other way?
			break;
		case document.location.href.includes("/sharedfiles/edititem/"):
			console.log("Point",11);
			InsertionPoint = document.getElementsByClassName("workshopDescContainer")[0];
			InsertButtons([InsertionPoint.lastElementChild],"0px","22px",BBFull);
			break;
		default: // kinda default
			if (InsertionPoint.length>0) {
				console.log("Point",12);
				InsertButtons(InsertionPoint,"44px","22px",BBLimited);
				alert("Steam BBCodes inserted at default point - report this page\r\n"+document.location.href);
			} else {
				console.log("Point",00);
				alert("Steam BBCodes has no place to insert at\r\n"+document.location.href);
			};
			break;
	};
	if (!TriggerCheck) {
		alert("Didn't trigger\r\n"+document.location.href);
	};
};

function InsertButtons(InsertionPoint,ButtonOffset,ButtonHeight,BBExtended,InsertionFunction,InsertionRelation) {
	TriggerCheck = true; // check
	ButtonContainer.style.left = ButtonOffset; // changing dynamically according to insertion point
	ButtonBase.style.width = ButtonHeight; // ["min-width"]
	ButtonBase.style.height = ButtonHeight;
	for (let A=0;A<InsertionPoint.length;A++) {
		console.log("Log",InsertionPoint.length,"/",A+1,ButtonOffset,ButtonHeight,BBExtended,InsertionPoint[A]);
		let ClonedContainer = ButtonContainer.cloneNode(true);
		/*
		var RestyledButtons = InsertionPoint[A].getElementsByClassName("btn_medium");
		for (let C=RestyledButtons.length-1;C>=0;C--) { // live collection
			RestyledButtons[C].className = RestyledButtons[C].className.replace("btn_medium","btn_small"); // resizing buttons
		};
		*/
		Object.keys(TagList).forEach(function(Match){ // building buttons each time 'cause I need to cycle them anyway after cloning to set event handlers
			if (BBExtended||!TagList[Match].Extended) { // if all tags are supported or tag isn't an extended one; depends on comment destination; also serves to prevent controls' overlaping
				let ClonedBase = ButtonBase.cloneNode(true);
				ClonedBase.title = TagList[Match].Title;
				ClonedBase.querySelector("Img").style["background-position"] = TagList[Match].Offset;
				ClonedContainer.appendChild(ClonedBase).addEventListener(
					"click",
					BBCode.bind(this,Match),
					false
				);
			};
		});
		if (InsertionFunction!=undefined&&InsertionRelation!=undefined) {
			InsertionPoint[A][InsertionFunction](ClonedContainer,InsertionRelation);
		} else {
			InsertionPoint[A].insertBefore(ClonedContainer,InsertionPoint[A].firstElementChild); // inserting buttons
		};
	};
};

function DiscussionsButtonFixer() { // resizing buttons for consistent look
	Array.from(document.querySelectorAll(".forum_newtopic_action > .btn_medium,	.commentthread_edit_buttons > .btn_medium")).forEach(function(Match){
		Match.classList.toggle("btn_medium"); // turning off
		Match.classList.toggle("btn_small"); // turning on
	});
};

function BBCode(Tag) { // tags use only "\n" to match form linebreaks in further checks
	switch (Tag) {
		case "URL":
			WrapSelection("["+Tag+"="+prompt("Link:")+"]","[/"+Tag+"]");
			break;
		case "List":
		case "OList":
			WrapSelectionMultiline("["+Tag+"]\n","\n[/"+Tag+"]","[*] ");
			break;
		case "Table":
			let TableSize = prompt("Table size, width x height:").match(/\s*(\d+)\s*.\s*(\d+)\s*/);
			if (TableSize) {
				//TableSize[1] = parseInt(TableSize[1],10);
				//TableSize[2] = parseInt(TableSize[2],10);
				console.log("Table",TableSize[1],"x",TableSize[2]);
				let TableStructure = "[Table]\n";
				for (let A=0;A<TableSize[2];A++) {
					TableStructure += "    [TR]\n";
					for (let B=0;B<TableSize[1];B++) {
						TableStructure += "        [TD]\n        [/TD]\n";
					};
					TableStructure += "    [/TR]\n";
				};
				TextArea.element.value += TableStructure + "[/Table]";
			} else {
				alert("Wrong dimensions.");
			};
			break;
		default:
			WrapSelection("["+Tag+"]","[/"+Tag+"]");
			break;
	};
};

function WrapSelection(Before,After) {
	var Start = TextArea.selectionStart;
	var End = TextArea.selectionEnd;
	var Text = TextArea.value;
	var Selection = Text.substring(TextArea.selectionStart,TextArea.selectionEnd);
	if (Selection.startsWith(Before)&&Selection.endsWith(After)) {
		Selection = Selection.substring(Before.length,Selection.length-After.length);
		End -= Before.length + After.length;
	} else {
		Selection = (Before || "") + Selection + (After || "");
		End += Before.length + After.length;
	};
	TextArea.value = Text.substring(0,TextArea.selectionStart)
		+ Selection
		+ Text.substring(TextArea.selectionEnd,Text.length);
	TextArea.selectionStart = Start; // preserving selection
	TextArea.selectionEnd = End;
};

function WrapSelectionMultiline(Before,After,LineBefore,LineAfter) {
	var Start = TextArea.selectionStart;
	var End = TextArea.selectionEnd;
	var Text = TextArea.value;
	var Selection = Text.substring(TextArea.selectionStart,TextArea.selectionEnd);
	var SelectionLength = Selection.length;
	if (Selection.startsWith(Before)&&Selection.endsWith(After)) {
		Selection = Selection.substring(Before.length,Selection.length-After.length);
		Selection = Selection.split("\n");
		Selection.forEach(function(Match,Index){
			Selection[Index] = Match.substring((LineBefore||"").length,Match.length-(LineAfter||"").length);
		});
		Selection = Selection.join("\n");
		End -= SelectionLength - Selection.length;
	} else {
		Selection = Selection.split("\n");
		Selection.forEach(function(Match,Index){
			Selection[Index] = (LineBefore || "") + Match + (LineAfter || "");
		});
		Selection = Selection.join("\n");
		Selection = (Before || "") + Selection + (After || "");
		End += Selection.length - SelectionLength;
	};
	TextArea.value = Text.substring(0,TextArea.selectionStart)
		+ Selection
		+ Text.substring(TextArea.selectionEnd,Text.length);
	TextArea.selectionStart = Start;
	TextArea.selectionEnd = End;
};

BBCodesInitialization();
//Ajax.Responders.unregister(Responder);