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
		Title: "Spoiler",
		Offset: SteamBBCodesBeholder()
			? (-16 * 5).toString(10) + "px 0px"
			: (-16 * 13).toString(10) + "px 0px",
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
			TextAreaInitialize();
			InsertionPoint = document.getElementsByClassName("commentthread_edit_buttons");
			InsertButtons(InsertionPoint,"0px","22px",BBFull);
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

function BBCodesInitialize() {
	var TempElem;
	var TextAreas = document.body.getElementsByTagName("TextArea");
	if (TextAreas.length>0) { // if there is a textarea, probably it's for comments
		document.head.appendChild(ButtonStyle);
		TextAreaInitialize();
		Ajax.Responders.register(Responder); // reinserting buttons in case of comment reloading - new post/edited post/new page
		InsertionInitialize();
	};
};

function TextAreaInitialize() {
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

function InsertionInitialize() { // I don't make additional check for if any elements were found because it would be just a cycle with 0 iterations in InsertButtons() if not
	var InsertionPoint = document.getElementsByClassName("commentthread_entry_submitlink"); // has different offset and tag support depending on page
	console.log("Check\r\n",InsertionPoint);
	switch (document.location.href) {
		case document.location.href.includes("/home"): // new comment in activity; trailing slash omitted just in case
		case document.location.href.includes("/status/"): // new comment in status
		case document.location.href.includes("/friendactivitydetail/"): // new comment in purchase
			console.log("Point",1);
			InsertButtons(InsertionPoint,"50px","22px",BBLimited);
			break;
		case document.location.href.includes("/discussions/"): // new comment on forum
			console.log("Point",2);
			InsertButtons(InsertionPoint,"44px","22px",BBFull);
			break;
		case document.location.href.match(/\/(id|profiles|groups)\/[^\/]*\/?$/): // new comment in profile/group
		case document.location.href.includes("/filedetails/"): // new comment in screenshot/artwork/Workshop/Greenlight
		case document.location.href.includes("announcements/detail/"): // new comment in announcement of a group/game
		case document.location.href.includes("/recommended/"): // new comment in review
		case document.location.href.includes("/news/"): // new comment in news; Store & Community has separate news
		case document.location.href.includes("events/"): // new comment in group event
			//document.location.href.search(/\/games\/\d*\/announcements\/detail\//) should be no longer needed
			console.log("Point",3);
			InsertButtons(InsertionPoint,"44px","22px",BBLimited);
			break;
		case document.location.href.includes("/home"): // status
			console.log("Point",4);
			InsertionPoint = document.getElementsByClassName("blotter_status_submit_ctn");
			InsertButtons(InsertionPoint,"40px","24px",BBLimited);
			break;
		case document.location.href.includes("/discussions"): // new topic, topic edit; comment edit; trailing slash omitted to work with group forum index
			console.log("Point",5);
			InsertionPoint = document.getElementsByClassName("forum_newtopic_action"); // "forum_newtopic_textcontrols" forum_newtopic_area forum_newtopic_box
			InsertButtons(InsertionPoint,"44px","22px",BBFull);
			InsertionPoint = document.getElementsByClassName("commentthread_edit_buttons");
			InsertButtons(InsertionPoint,"0px","22px",BBFull);
			break;
		case document.location.href.includes("store.steampowered.com/app/"): // new review
			ButtonContainer.style.float = "none"; // prventing siblings from being on the same line
			ButtonContainer.style["margin-bottom"] = "9px";
			//InsertionPoint = document.getElementsByClassName("review_controls_right")[0];
			InsertionPoint = document.getElementsByClassName("review_controls")[0];
			InsertButtons([InsertionPoint],"0px","22px",BBFull); // passing 1 element as an array to enable length property; doesn't have suitable block for buttons, passing like this to remove additional checks
			console.log("Point",6);
			//if (InsertionPoint) {};
			break;
		case document.location.href.includes("/recommended/"): // review edit
			InsertionPoint = document.getElementById("ReviewEdit");
			InsertButtons([InsertionPoint],"0px","22px",BBFull,"insertBefore",document.getElementById("ReviewEditTextArea").nextSibling);
			console.log("Point",7);
			//if (InsertionPoint) {};
			break;
		case document.location.href.match(/\/announcements\/(create|edit)/): // new group announcement
			InsertionPoint = document.getElementsByClassName("btn_grey_black btn_small_thin")[0]; // "Formatting help" button
			InsertButtons([InsertionPoint.parentElement],"0px","22px",BBFull); // has a suitable block, but it doesn't have unique handles
			console.log("Point",8);
			//if (InsertionPoint&&document.location.href.includes("")) {};
			break;
		case document.location.href.match(/\/edit(\/profile)?$/): // user/group profile edit
			InsertionPoint = document.getElementsByClassName("btn_grey_black btn_small_thin")[0];
			InsertButtons([InsertionPoint.parentElement],"0px","22px",BBLimited);
			console.log("Point",9);
			break;
		case document.location.href.includes("/itemedittext/"): // screenshot/artwork/workshop edit
			ButtonContainer.style["margin-top"] = "5px";
			InsertionPoint = document.getElementById("ItemEditText");
			InsertButtons([InsertionPoint],"158px","22px",BBFull,"insertBefore",InsertionPoint.getElementsByClassName("btn_green_white_innerfade btn_medium")[0]); // I already use insertBefore, MB refactor other way?
			console.log("Point",10);
			break;
		case document.location.href.includes("/sharedfiles/edititem/"):
			InsertionPoint = document.getElementsByClassName("workshopDescContainer")[0];
			InsertButtons([InsertionPoint.lastElementChild],"0px","22px",BBFull);
			console.log("Point",11);
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
				let ClonedBase = ButtonBase.cloneNode();
				ClonedBase.title = Match.Title;
				ClonedBase.querySelector("Img").style["background-position"] = Match.Offset;
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

function BBCode(Tag) {
	switch (Tag) {
		case "URL":
			WrapSelection("["+Tag+"="+prompt("Link:")+"]","[/"+Tag+"]");
			break;
		case "List":
		case "OList":
			WrapSelectionMultiline("["+Tag+"]\r\n","\r\n[/"+Tag+"]","[*] ");
			break;
		case "Table":
			let TableSize = prompt("Table size, width x height:").match(/\s*(\d+)\s*.\s*(\d+)\s*/);
			if (TableSize) {
				//TableSize[1] = parseInt(TableSize[1],10);
				//TableSize[2] = parseInt(TableSize[2],10);
				console.log("Table",TableSize[1],"x",TableSize[2]);
				let TableStructure = "[Table]\r\n";
				for (let A=0;A<TableSize[2];A++) {
					TableStructure += "    [TR]\r\n";
					for (let B=0;B<TableSize[1];B++) {
						TableStructure += "        [TD]\r\n        [/TD]\r\n";
					};
					TableStructure += "    [/TR]\r\n";
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
	var Text = TextArea.value;
	TextArea.value = Text.substring(0,TextArea.selectionStart)
		+ (Before || "")
		+ Text.substring(TextArea.selectionStart,TextArea.selectionEnd)
		+ (After || "")
		+ Text.substring(TextArea.selectionEnd,Text.length);
	TextArea.selectionEnd += Before.length + After.length;
};

function WrapSelectionMultiline(Before,After,LineBefore,LineAfter) {
	var Text = TextArea.value;
	var Selection = "";
	var SelectionLength = TextArea.selectionEnd - TextArea.selectionStart;
	Text.substring(TextArea.selectionStart,TextArea.selectionEnd).split("\n").forEach(function(Match){
		Selection += (LineBefore || "") + Match + (LineAfter || "") + "\n";
	});
	TextArea.value = Text.substring(0,TextArea.selectionStart)
		+ (Before || "")
		+ Selection
		+ (After || "")
		+ Text.substring(TextArea.selectionEnd,Text.length);
	TextArea.selectionEnd += Before.length + After.length + Selection.length - SelectionLength;
};

BBCodesInitialize();
//Ajax.Responders.unregister(Responder);