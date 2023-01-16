addEventListener("load", Init);

function Init() {
	setInterval(ChangeColor, 2000);
};

function ChangeColor() {
	var Clr = Math.floor(Math.random() * 256 * 256 * 256);
	Clr = Clr.toString(16).padStart(6,"0");
	document.body.style.backgroundColor = `#${Clr}`;
};