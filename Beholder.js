var Ajax = window.eval("Ajax");

// little easteregg
if (GM_getValue("Beholder")==undefined&&document.getElementById("account_pulldown").textContent.toLocaleUpperCase().includes("BEHOLDER")) {
	GM_setValue("Beholder","ICU");
};

function Beholder(HeSeesUs) {
	if (HeSeesUs&&typeof(HeSeesUs.detail)=="boolean") {
		GM_setValue("Beholder",HeSeesUs);
	};
	return !!GM_getValue("Beholder"); // returning eye state
};

function SteamBBCodesBeholder(State) {
	document.dispatchEvent(new CustomEvent("Behold",{detail:State}));
};

document.addEventListener("Behold",Beholder,false);
window.eval("var SteamBBCodesBeholder = "+SteamBBCodesBeholder+";");