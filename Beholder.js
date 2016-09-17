// little easteregg
var Pulldown = document.getElementById("account_pulldown"); // account menu with nickname
var SteamBBCodes;
if (Pulldown
	&&Pulldown.textContent.toLocaleUpperCase().includes("BEHOLDER")
	&&GM_getValue("Beholder")==undefined) {
	GM_setValue("Beholder",true);
};
if (GM_getValue("Beholder")) {
	console.log("You are Beholder! Type \"SteamBBCodes.Blink()\" here to close your eye and pretend to be normal.");
};
SteamBBCodes = {
	HeSeesUs: GM_getValue("Beholder"),
	Blink: function(){
		document.dispatchEvent(new Event("Blink"));
	}
};

function BlinkBack() {
	GM_setValue("Beholder",!GM_getValue("Beholder"));
};

document.addEventListener("Blink",BlinkBack,false);
window.eval("var SteamBBCodes = "+SteamBBCodes.toSource()+";");

/*
function BackListener(State) {
	if (State&&State.detail!=undefined) {
		GM_setValue("Listener",State);
	} else {
		document.dispatchEvent(new CustomEvent("FrontEvent",{detail:GM_getValue("Listener","")}));
	};
};

document.addEventListener("BackEvent",BackListener,false);

function FrontListener(State) {
	if (State==undefined||State.detail==undefined) {
		document.dispatchEvent(new CustomEvent("BackEvent"));
	} else {
		console.log("detail",State.detail,"\r\nState",State);
	};
};

window.eval(FrontListener.toString());
window.eval('document.addEventListener("FrontEvent",FrontListener,false);');
*/