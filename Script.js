/*
can't use rate headers because of CORS
X-Ratelimit-Remaining
X-Ratelimit-Reset
X-Ratelimit-Limit
*/

"use stict";

var List = document.getElementById("List");
var FormSearch = document.getElementById("FormSearch");
var TextSearch = document.getElementById("TextSearch");
var SelectCooldown = document.getElementById("SelectCooldown");
var SelectSort = document.getElementById("SelectSort");
var ButtonSearch = document.getElementById("ButtonSearch");
var ButtonCattributes = document.getElementById("ButtonCattributes");
var LinkAPI = "https://api.cryptokitties.co/";
var LinkSite = "https://www.cryptokitties.co/";
var SearchURL = new URL(LinkAPI);
var Ether = 1000000000000000000;
var Limit = 20; // current search limit forced by CK
var Offset = 0;
var Population = 0;
var CooldownList = ["Fast","Swift","Swift","Snappy","Snappy","Brisk","Brisk","Plodding","Plodding","Slow","Slow","Sluggish","Sluggish","Catatonic"];
var RarityList = [["Legendary",1],["Exotic",5],["Rare",10],["Uncommon",20],["Common",100]]; // completely arbitrary tiers - name & percentage
FormSearch.addEventListener("submit",SearchKitties);
ButtonCattributes.addEventListener("click",CountKitties);
SearchURL.pathname = "/auctions";
SearchURL.searchParams.set("limit",Limit); 
SearchURL.searchParams.set("type","sale");
SearchURL.searchParams.set("status","open");
SearchURL.searchParams.set("parents",false);
RarityLegend();

/*
window.addEventListener("error",(Event)=>{
	Event.preventDefault();
	console.error(Event.message);
});
*/

function SearchKitties(Event) {
	Event.preventDefault();
	ButtonSearch.disabled = true;
	FiltersUpdate();
	if (TextSearch.value.length>0) {
		if (SearchURL.searchParams.get("search")!=TextSearch.value) { // resetting if new search
			Offset = 0;
			Array.from(List.children).forEach((Div)=>{Div.remove();}); // avoiding innerHTML, but maybe I shouldn't in this case
			SearchURL.searchParams.set("search",TextSearch.value);
		};
	} else {
		SearchURL.searchParams.delete("search");
	};
	switch (SelectSort.value) { // setting sorting order
		case "Cheap":
			SearchURL.searchParams.set("sorting","cheap");
			SearchURL.searchParams.set("orderBy","current_price");
			SearchURL.searchParams.set("orderDirection","asc");
			break;
		case "Expensive":
			SearchURL.searchParams.set("sorting","expensive");
			SearchURL.searchParams.set("orderBy","current_price");
			SearchURL.searchParams.set("orderDirection","desc");
			break;
		case "Young":
			SearchURL.searchParams.delete("sorting");
			SearchURL.searchParams.delete("orderBy");
			SearchURL.searchParams.delete("orderDirection");
			break;
		case "Old":
			SearchURL.searchParams.set("sorting","old-first");
			SearchURL.searchParams.delete("orderBy");
			SearchURL.searchParams.set("orderDirection","asc");
			break;
	};
	SearchURL.searchParams.set("offset",Offset);
	fetch(SearchURL).then((Data)=>(Data.json())).then((Data)=>{ // building the list
		let Fragment = new DocumentFragment();
		Data.auctions.forEach((Cat)=>{
			let A = document.createElement("A");
			let Kitty = document.createElement("Div");
			let Div = document.createElement("Div");
			let KittyCooldown = CooldownList[Cat.kitty.status.cooldown_index];
			A.href = `${LinkSite}kitty/${Cat.kitty.id}`;
			A.appendChild(document.createElement("Img")).src = Cat.kitty.image_url;
			Kitty.id = Cat.kitty.id;
			Kitty.className = "Kitty New";
			Kitty.append(A,Div,document.createElement("Div"));
			Kitty.children[2].className = "Cattributes";
			Div.className = "Data";
			Div.append(document.createElement("Div"),document.createElement("Div"),document.createElement("Div"));
			Div.children[0].className = "Generation";
			Div.children[0].dataset.before = "Gen";
			Div.children[0].textContent = Cat.kitty.generation;
			Div.children[1].className = "Cooldown";
			Div.children[1].dataset.before = "CD";
			Div.children[1].textContent = KittyCooldown;
			Div.children[2].className = "Price";
			Div.children[2].dataset.before = "ETH";
			Div.children[2].textContent = (parseFloat(Cat.current_price)/Ether).toFixed(8); // I'm too lazy to dig into CK's code; that's how I understand their convertion of JSON data
			Fragment.append(Kitty);
		});
		List.append(Fragment);
		Offset += Limit;
		if (Offset>=Data.total) { // reached the end of the list
			ButtonSearch.disabled = true; // locking the button until new query
			ButtonSearch.value = "That's all";
			TextSearch.addEventListener("input",SearchInput);
			FormSearch.addEventListener("change",SearchInput);
		} else {
			ButtonSearch.disabled = false;
		};
	}).catch((Message)=>{console.error("Search error",Message);});
};

function FiltersUpdate() {
	let Cooldown = Array.from(SelectCooldown.selectedOptions).map((Item)=>(Item.value));
	let Generation = document.getElementById("NumberGeneration").value;
	let Type = document.getElementById("SelectType").value;
	Cooldown = Cooldown ? `cooldown:${Cooldown.join(",")}` : "";
	Generation = Generation == -1 ? "" : `gen:${Generation}`;
	Type = Type ? `type:${Type}` : "";
	TextSearch.value = TextSearch.value.replace(/(cooldown|gen|type):(\w+,?)+\s?/g,""); // erasing previous filters first
	TextSearch.value = `${TextSearch.value} ${Cooldown} ${Generation} ${Type}`.trim().replace(/\s+/g," "); // adding new filters, erasing extra spaces; explicitly referencing TextSearch.value for proper spacing
};

function SearchInput() { // resetting the lock; maybe a bit excessive
	ButtonSearch.disabled = false;
	ButtonSearch.value = "Search";
	TextSearch.removeEventListener("input",SearchInput);
	FormSearch.removeEventListener("change",SearchInput);
};

function CountKitties() { // getting overall amount to count percents
	ButtonCattributes.disabled = true;
	if (!Population) {
		fetch(LinkAPI+"kitties?limit=1").then((Data)=>(Data.json())).then((Data)=>{
			Population = Data.total;
			EvaluateKitties();
		}).catch((Message)=>{console.error("Population error ",Message);});
	} else { // repeating 'cause async
		EvaluateKitties();
	};
};

function EvaluateKitties() { // getting cattributes' rarity
	ButtonCattributes.removeEventListener("click",CountKitties);
	ButtonCattributes.addEventListener("click",GatherKitties);
	GatherKitties();
	return; // skipping 'cause CORS
	fetch("https://cryptokittydex.com/").then((Data)=>(Data.text())).then((Data)=>{
		let RE = /cattribute" href="\/cattributes\/(\w+)">[^]+?(\d+(?:,\d+)?)<\/span>/g;
		let Next = RE.exec(Data);
		while (Next) {
			let Amount = parseInt(Next[2].replace(",",""),10);
			Rarities[Next[1]] = {
				Total: Amount,
				Percent: Amount/Population*100
			};
			Next = RE.exec(Data);
		};
	}).catch((Message)=>{console.error("Stats error",Message);});
};

function GatherKitties() { // getting Ids of found kitties
	ButtonCattributes.disabled = true;
	let Kitties = Array.from(document.getElementsByClassName("Kitty New")).map((Div)=>(Div.id));
	Kitties = Kitties.reverse(); // popping in reverse
	LoadKitties(Kitties,Kitties.length);
};

function LoadKitties(Kitties,Length) { // loading cattributes
	let Id = Kitties.pop();
	if (!Id) {
		ButtonCattributes.disabled = false;
		return;
	};
	fetch("https://api.cryptokitties.co/kitties/"+Id).then((Data)=>(Data.json())).then((Data)=>{
		let Cattributes = Data.cattributes.map((Cattribute)=>{
			let Span = document.createElement("Span");
			let Rarity = Rarities[Cattribute.description];
			Rarity = Rarity ? Rarity.Percent : 0.001; // rarity percentage; high rarity assumed if it's not in the list
			Rarity = RarityList.find((Element)=>(Rarity<=Element[1])); // rarity name
			Span.textContent = Cattribute.description;
			Span.classList.add(Cattribute.type);
			Span.classList.add(Rarity[0]);
			return(Span);
		});
		document.getElementById(Id).getElementsByClassName("Cattributes")[0].append(...Cattributes);
		document.getElementById(Id).classList.remove("New"); // marking to prevent repeated loading of attributes
		setTimeout(LoadKitties,100,Kitties,Kitties.length); // timeout to prevent overload
	}).catch((Message)=>{console.error("Cattribute error",Message);});
};

function RarityLegend() { // automatically filling the legend to lessen needed editing
	var Signature = document.querySelector("Div.Signature > P");
	var Legend = document.createElement("Span");
	RarityList.forEach((Rarity,Index)=>{
		let Span = document.createElement("Span");
		Span.textContent = Rarity[0];
		Span.className = Rarity[0];
		Legend.append(`${Index==0?"":" "}`,Span,` ${Rarity[1]}%`); // adding leading space as needed
	});
	Signature.insertBefore(Legend,Signature.firstChild);
};