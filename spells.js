function connect(content, connector, translation) {
	let str = "";
	for (key in content) {
		let cur = content[key];
		str += (translation[cur] ?? cur) + connector;
	}
	return str.substring(0, str.length - connector.length);
}
function connectLevels(content, translation) {
	let str = "";
	for (key in content) {
		str += (translation[key] ?? key) + " " + content[key] + ", ";
	}
	return str.substring(0, str.length - 2);
}
function getTranslatedSource(sp) {
	let sourceTrans = "";
	for (key in sp["source"]) {
		let cur = sp["source"][key].split(" pg.")[0];
		sourceTrans += (translations.sourceTranslations[cur] ?? cur) + ", ";
	}
	return sourceTrans.substring(0, sourceTrans.length - 2);
}
function getSimpTranslatedSource(sp) {
	if (sp["source"].length == 1) {
		return getTranslatedSource(sp);
	}
	for (key in sp["source"]) {
		let cur = translations.sourceTranslations[sp["source"][key].split(" pg.")[0]];
		if (!cur.includes("-")) {
			return cur + ", ...";
		}
	}
	for (key in sp["source"]) {
		let cur = translations.sourceTranslations[sp["source"][key].split(" pg.")[0]];
		if (cur.includes("PCS") || cur.includes("PPC")) {
			return cur + ", ...";
		}
	}
	for (key in sp["source"]) {
		let cur = translations.sourceTranslations[sp["source"][key].split(" pg.")[0]];
		return cur + " ...";
	}
	return "";
}
function loadFeat(sp, div, containSource = false) {
	div.innerHTML = "";

	if (containSource) {
		div.appendChild(getTopBar());
		window.top.document.title = sp["name_zh"] ?? sp["name"];
		$(div).append($("<hr>"));
	}

	// title
	let en_name = "<a href=\"" + sp["url"] + "\">" + sp["name"] + "</a>";
	let name = (sp["name_zh"] != null) ? (sp["name_zh"] + " (" + en_name + ")") : en_name;
	if (sp["race_zh"] != null) {
		name += " [" + sp["race_zh"] + "]";
	}
	name += " <sup>" + getTranslatedSource(sp) + "</sup>";
	$(div).append($("<h3>" + name + "</h3>"));

	// school
	let schoolString = "<b>学派</b>&#12288;&#12288;&#12288;&#12288;" + translations.schoolTranslations[sp["school"]] ?? sp["school"];
	if (sp["subSchools"] != null) {
		let connector = sp["subSchoolsOperator"] == "," ? ", " : " 或 ";
		let subSchoolString = connect(sp["subSchools"], connector, translations.subSchoolsTranslations);
		schoolString += " (" + subSchoolString + ")";
	}
	if (sp["descriptors"] != null) {
		let connector = sp["descriptorsOperator"] == "," ? ", " : " 或 ";
		let descriptorsString = connect(sp["descriptors"], connector, translations.descriptorsTranslations);
		schoolString += " [" + descriptorsString + "]";
	}
	$(div).append($("<div>" + schoolString + "</div>"));

	// levels
	if (sp["levels"] != null) $(div).append($("<div><b>环位</b>&#12288;&#12288;&#12288;&#12288;" + connectLevels(sp["levels"], translations.classTranslations) + "</div>"));

	// other
	if (sp["castingTime_zh"] != null) $(div).append($("<div><b>施法时间</b>&#12288;&#12288;" + sp["castingTime_zh"] + "</div>"));
	if (sp["components_zh"] != null) $(div).append($("<div><b>成分</b>&#12288;&#12288;&#12288;&#12288;" + sp["components_zh"] + "</div>"));
	else if (sp["components"] != null) $(div).append($("<div><b>成分</b>&#12288;&#12288;&#12288;&#12288;" + sp["components"] + "</div>"));
	if (sp["range_zh"] != null) $(div).append($("<div><b>范围</b>&#12288;&#12288;&#12288;&#12288;" + sp["range_zh"] + "</div>"));
	if (sp["effect_zh"] != null) $(div).append($("<div><b>效果</b>&#12288;&#12288;&#12288;&#12288;" + sp["effect_zh"] + "</div>"));
	else if (sp["effect"] != null) $(div).append($("<div><b>效果</b>&#12288;&#12288;&#12288;&#12288;" + sp["effect"] + "</div>"));
	if (sp["targetOrArea_zh"] != null) $(div).append($("<div><b>目标或范围</b>&#12288;" + sp["targetOrArea_zh"] + "</div>"));
	if (sp["target_zh"] != null) $(div).append($("<div><b>目标</b>&#12288;&#12288;&#12288;&#12288;" + sp["target_zh"] + "</div>"));
	if (sp["area_zh"] != null) $(div).append($("<div><b>区域</b>&#12288;&#12288;&#12288;&#12288;" + sp["area_zh"] + "</div>"));
	if (sp["duration_zh"] != null) $(div).append($("<div><b>持续时间</b>&#12288;&#12288;" + sp["duration_zh"] + "</div>"));
	if (sp["savingThrow_zh"] != null) $(div).append($("<div><b>豁免</b>&#12288;&#12288;&#12288;&#12288;" + sp["savingThrow_zh"] + "</div>"));
	if (sp["spellResistance_zh"] != null) $(div).append($("<div><b>法术抗力</b>&#12288;&#12288;" + sp["spellResistance_zh"] + "</div>"));

	// text
	if (sp["text_zh"] != null) {
		$(div).append($(sp["text_zh"]));
	} else {
		$(div).append($("<p>" + sp["text"] + "</p>"));
	}

	// source
	let sourceStr = "";
	for (key in sp["source"]) {
		sourceStr += "<br>" + sp["source"][key];
	}
	$(div).append($("<p><b>出处</b>" + sourceStr + "</p>"));

	// mythic text
	if (sp["mythicText_zh"] ?? sp["mythicText"] != null) {
		$(div).append($("<hr><h4>神话版本</h4>"));
		if (sp["mythicText_zh"] != null) {
			$(div).append($(sp["mythicText_zh"]));
		} else {
			$(div).append($("<p>" + sp["mythicText"] + "</p>"));
		}
		$(div).append($("<p><b>出处</b><br>" + sp["mythicSource"] + "</p>"));
	}
}
function loadUrlFeat() {
	let key = urlAttributes["spell"];
	key = key.toLowerCase();
	fetch("/pathfinder/spells/" + key + ".json").then(response => {
		if (response.ok) {
			return response.text();
		} else {
			return null;
		}
	}).then(text => {
		if (text != null) {
			sp = JSON.parse(text);
			loadFeat(sp, document.getElementById("box"), true);
		}
	}).catch(error => {
		console.log(error);
	});
}
function getLevels(sp) {
	let min = {
		"high": 9,
		"medium": 9,
		"low": 9
	};
	let max = {
		"high": -1,
		"medium": -1,
		"low": -1
	};
	for (key in sp["levels"]) {
		let progress = translations.classSpellProgression[key] ?? "high";
		let level = sp["levels"][key];
		if (min[progress] > level) {
			min[progress] = level
		}
		if (max[progress] < level) {
			max[progress] = level
		}
	}
	let str = {};
	for (key in max) {
		if (max[key] != -1) {
			if (max[key] == min[key]) {
				str[key] = max[key] + "";
			} else {
				str[key] = min[key] + "~" + max[key];
			}
		}
	}
	let levelsString = "";
	let cur;
	if (str["high"] != null) {
		cur = str["high"];
		levelsString += str["high"] + " ";
	}
	if (str["medium"] != null && str["medium"] != cur) {
		cur = str["medium"];
		levelsString += "<font color='Blue'>" + str["medium"] + "</font> ";
	}
	if (str["low"] != null && str["low"] != cur) {
		levelsString += "<font color='Green'>" + str["low"] + "</font> ";
	}
	return levelsString.substring(0, levelsString.length - 1);
}
function addBoxes(dict, element, array, nonempty = false, check = true, sort = true, other = false) {
	let boxAll = document.createElement("div");
	boxAll.style = "display: flex; ";
	let checkboxAll = document.createElement("input");
	checkboxAll.type = "checkbox";
	checkboxAll.name = "all";
	checkboxAll.checked = check;
	boxAll.appendChild(checkboxAll);
	array.push(checkboxAll);
	let labelAll = document.createElement("div");
	labelAll.innerHTML = "全选";
	boxAll.appendChild(labelAll);
	element.appendChild(boxAll);
	checkboxAll.addEventListener("change", (event) => {
		for (i in array) {
			array[i].checked = event.currentTarget.checked;
		}
	});

	if (!nonempty) {
		let boxNone = document.createElement("div");
		boxNone.style = "display: flex; ";
		let checkboxNone = document.createElement("input");
		checkboxNone.type = "checkbox";
		checkboxNone.name = "none";
		checkboxNone.checked = check;
		boxNone.appendChild(checkboxNone);
		array.push(checkboxNone);
		let labelNone = document.createElement("div");
		labelNone.innerHTML = "无";
		boxNone.appendChild(labelNone);
		element.appendChild(boxNone);
	}

	let keys;
	if (sort) {
		keys = Object.keys(dict);
		keys.sort();
	} else {
		keys = dict;
	}
	for (i in keys) {
		if (keys[i].includes("see ") || keys[i] == "variable") continue;
		let box = document.createElement("div");
		box.style = "display: flex; ";
		let checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.name = keys[i];
		checkbox.checked = check;
		box.appendChild(checkbox);
		array.push(checkbox);
		let label = document.createElement("div");
		label.innerHTML = sort ? dict[keys[i]] : keys[i];
		box.appendChild(label);
		element.appendChild(box);
	}

	if (other) {
		let boxOther = document.createElement("div");
		boxOther.style = "display: flex; ";
		let checkboxOther = document.createElement("input");
		checkboxOther.type = "checkbox";
		checkboxOther.name = "other";
		checkboxOther.checked = check;
		checkboxOther["exclude"] = dict;
		boxOther.appendChild(checkboxOther);
		array.push(checkboxOther);
		let labelNone = document.createElement("div");
		labelNone.innerHTML = "其它";
		boxOther.appendChild(labelNone);
		element.appendChild(boxOther);
	}

}
var schoolBoxes = [];
var subSchoolsBoxes = [];
var descriptorsBoxes = [];
var classBoxes = [];
var levelsBoxes = [];
var sourceBoxes = [];
var source2Boxes = [];
var castingTimeBoxes = [];
var durationBoxes = [];
var spellResistanceBoxes = [];
var rangeBoxes = [];
var savingThrowBoxes = [];
var translations;
function loadTransAndSearchElements() {
	fetch("/pathfinder/script/translations.json").then(response => {
		if (response.ok) {
			return response.text();
		} else {
			alert('Failed to fetch translation content.');
			return null;
		}
	}).then(text => {
		if (text == null) {
			return;
		}
		translations = JSON.parse(text);

		addBoxes(translations.schoolTranslations, document.getElementById("school"), schoolBoxes, true);
		addBoxes(translations.subSchoolsTranslations, document.getElementById("subSchools"), subSchoolsBoxes);
		addBoxes(translations.descriptorsTranslations, document.getElementById("descriptors"), descriptorsBoxes);
		addBoxes(translations.classTranslations, document.getElementById("clazz"), classBoxes, true, false);
		let levelTranslations = {};
		for (let i = 0; i <= 9; i++) {
			levelTranslations[i] = i + "环";
		}
		addBoxes(levelTranslations, document.getElementById("levels"), levelsBoxes, true, false);
		addBoxes(["CRB", "APG", "ARG", "ACG", "UM", "UC", "UI", "OA"], document.getElementById("source"), sourceBoxes, true, true, false);
		addBoxes(["MA", "MC", "HA", "VC", "AG", "BotD", "UW", "PA", "AP", "PCS", "PPC", "Mod", "other"], document.getElementById("source2"), source2Boxes, true, true, false);
		addBoxes(["标准动作", "迅捷动作", "直觉动作", "整轮动作", "1轮", "1分钟", "10分钟", "1小时"], document.getElementById("castingTime"), castingTimeBoxes, true, true, false, true);
		addBoxes(["立即", "1轮", "1轮/等级", "1分钟/等级", "10分钟/等级", "1小时/等级", "24小时", "1天/等级", "永久"], document.getElementById("duration"), durationBoxes, true, true, false, true);
		addBoxes(["个人", "接触", "近距", "中距", "远距"], document.getElementById("range"), rangeBoxes, true, true, false, true);
		addBoxes(["否", "可"], document.getElementById("spellResistance"), spellResistanceBoxes, true, true, false, true);
		addBoxes(["反射", "强韧", "意志", "无"], document.getElementById("savingThrow"), savingThrowBoxes, true, true, false, true);
	}).catch(error => {
		console.log(error);
	});
}
function loadTransAndUrlSpell() {
	fetch("/pathfinder/script/translations.json").then(response => {
		if (response.ok) {
			return response.text();
		} else {
			alert('Failed to fetch translation content.');
			return null;
		}
	}).then(text => {
		if (text == null) {
			return;
		}
		translations = JSON.parse(text);
		loadUrlFeat();
	}).catch(error => {
		console.log(error);
	});
}
function cell(text) {
	let cell = document.createElement("td");
	cell.innerHTML = text ?? "";
	return cell;
}
function centerCell(text) {
	let cell = document.createElement("td");
	cell.innerHTML = text ?? "";
	cell.style.textAlign = "center";
	return cell;
}
function objectCell(object) {
	let cell = document.createElement("td");
	cell.appendChild(object);
	cell.style.textAlign = "center";
	return cell;
}
function restrict(text, len) {
	if (text == null) {
		return null;
	}
	if (text.length < len + 3) {
		return text;
	} else {
		return text.substring(0, len) + "...";
	}
}
function search() {
	let tableDiv = document.getElementById("table");
	tableDiv.innerHTML = "";
	let table = document.createElement("table");
	table.style.border = "";
	table.style.whiteSpace = "nowrap";
	let title = document.createElement("tr");
	title.style.textAlign = "center";
	title.innerHTML = "<th>法术</th><th>学派</th><th>子学派</th><th>描述符</th><th>出处</th><th>环位</th><th>种族/神祇</th><th>施法时间</th><th>豁免</th><th>法术抗力</th>"
	table.appendChild(title);
	for (i in spellsIndex) {
		let sp = spellsIndex[i];

		let name = document.getElementById("name").value;
		let name_legal = (sp["name_zh"] != null && sp["name_zh"].includes(name)) || (sp["name"] != null && sp["name"].toLowerCase().includes(name.toLowerCase()));

		let school = sp["school"];
		let school_legal = false;
		for (i in schoolBoxes) {
			school_legal |= schoolBoxes[i].checked && schoolBoxes[i].name == school;
			if (school_legal) break;
		}

		let subSchools = sp["subSchools"];
		if (subSchools == null) {
			subSchools = ["none"];
		}
		let subSchools_legal = false;
		for (i in subSchoolsBoxes) {
			for (j in subSchools) {
				subSchools_legal |= subSchoolsBoxes[i].checked && subSchoolsBoxes[i].name == subSchools[j];
				if (subSchools_legal) break;
			}
			if (subSchools_legal) break;
		}

		let descriptors = sp["descriptors"];
		if (descriptors == null) {
			descriptors = ["none"];
		}
		let descriptors_legal = false;
		for (i in descriptorsBoxes) {
			for (j in descriptors) {
				descriptors_legal |= descriptorsBoxes[i].checked && (descriptorsBoxes[i].name == descriptors[j] || descriptorsBoxes[i].name == "all");
				if (descriptors_legal) break;
			}
			if (descriptors_legal) break;
		}

		let levels = sp["levels"];
		let levels_legal = false;
		if (levels != null) {
			for (key in levels) {
				let class_legal = false;
				let level_legal = false;
				for (i in classBoxes) {
					class_legal |= classBoxes[i].checked && key == classBoxes[i].name;
				}
				for (i in levelsBoxes) {
					level_legal |= levelsBoxes[i].checked && levelsBoxes[i].name == levels[key];
				}
				levels_legal |= class_legal && level_legal;
				if (levels_legal) break;
			}
		}

		let source = sp["source"];
		let source_legal = false;
		for (i in sourceBoxes) {
			if (sourceBoxes[i].checked) {
				for (j in source) {
					let src = translations.sourceTranslations[source[j].split(" pg.")[0]];
					source_legal |= sourceBoxes[i].name == src.split("-")[0];
					if (source_legal) break;
				}
			}
		}
		for (i in source2Boxes) {
			if (source2Boxes[i].checked) {
				for (j in source) {
					let src = translations.sourceTranslations[source[j].split(" pg.")[0]];
					source_legal |= source2Boxes[i].name == src.split("-")[0];
					if (source_legal) break;
				}
			}
		}

		let castingTime_legal = false;
		{
			let castingTime = sp["castingTime_zh"];
			let inOther = true;
			for (i in castingTimeBoxes) {
				if (castingTimeBoxes[i].name == "other") {
					castingTime_legal |= castingTimeBoxes[i].checked && inOther;
				} else {
					if (castingTime != null && castingTime.includes(castingTimeBoxes[i].name)) {
						inOther = false;
						castingTime_legal |= castingTimeBoxes[i].checked;
					}
				}
				if (castingTime_legal) break;
			}
		}

		let duration_legal = false;
		{
			let duration = sp["duration_zh"];
			let inOther = true;
			for (i in durationBoxes) {
				if (durationBoxes[i].name == "other") {
					duration_legal |= durationBoxes[i].checked && inOther;
				} else {
					if (duration != null && duration.includes(durationBoxes[i].name)) {
						if (durationBoxes[i].name != "1轮" || duration == "1轮") {
							inOther = false;
							duration_legal |= durationBoxes[i].checked;
						}
					}
				}
				if (duration_legal) break;
			}
		}

		let range_legal = false;
		{
			let range = sp["range_zh"];
			let inOther = true;
			for (i in rangeBoxes) {
				if (rangeBoxes[i].name == "other") {
					range_legal |= rangeBoxes[i].checked && inOther;
				} else {
					if (range != null && range.includes(rangeBoxes[i].name)) {
						inOther = false;
						range_legal |= rangeBoxes[i].checked;
					}
				}
				if (range_legal) break;
			}
		}

		let spellResistance_legal = false;
		{
			let spellResistance = sp["spellResistance_zh"];
			let inOther = true;
			for (i in spellResistanceBoxes) {
				if (spellResistanceBoxes[i].name == "other") {
					spellResistance_legal |= spellResistanceBoxes[i].checked && inOther;
				} else {
					if (spellResistance != null && spellResistance.includes(spellResistanceBoxes[i].name)) {
						inOther = false;
						spellResistance_legal |= spellResistanceBoxes[i].checked;
					}
				}
				if (spellResistance_legal) break;
			}
		}

		let savingThrow_legal = false;
		{
			let savingThrow = sp["savingThrow_zh"];
			let inOther = true;
			for (i in savingThrowBoxes) {
				if (savingThrowBoxes[i].name == "other") {
					savingThrow_legal |= savingThrowBoxes[i].checked && inOther;
				} else {
					if (savingThrow != null && savingThrow.includes(savingThrowBoxes[i].name)) {
						inOther = false;
						savingThrow_legal |= savingThrowBoxes[i].checked;
					}
				}
				if (savingThrow_legal) break;
			}
		}

		let race_legal = !document.getElementById("race").checked || sp["race"] != null;
		let mythic_legal = !document.getElementById("mythic").checked || sp["mythic"];

		let en_legal = (!document.getElementById("en").checked) || sp["name_zh"] == null;

		let legal = (name != "" && name_legal) || (name == "" && school_legal && subSchools_legal && descriptors_legal && levels_legal && source_legal && castingTime_legal && duration_legal && range_legal && spellResistance_legal && savingThrow_legal && race_legal && mythic_legal && en_legal);
		if (legal) {
			let row = document.createElement("tr");
			let nameCell = cell(sp["name_zh"] ?? sp["name"]);
			nameCell.className = "tooltip";
			row.appendChild(nameCell);
			row.appendChild(centerCell(translations.schoolTranslations[sp["school"]] ?? sp["school"]));
			let subSchoolString = null;
			if (sp["subSchools"] != null) {
				let connector = sp["subSchoolsOperator"] == "," ? ", " : " 或 ";
				subSchoolString = connect(sp["subSchools"], connector, translations.subSchoolsTranslations);
			}
			row.appendChild(centerCell(subSchoolString));
			let descriptorsString = null;
			if (sp["descriptors"] != null) {
				let connector = sp["descriptorsOperator"] == "," ? ", " : " 或 ";
				descriptorsString = connect(sp["descriptors"], connector, translations.descriptorsTranslations);
			}
			row.appendChild(centerCell(descriptorsString));
			row.appendChild(centerCell(getSimpTranslatedSource(sp)));
			row.appendChild(centerCell(getLevels(sp)));
			let race = translations.raceTranslations[sp["race"]];
			if (race == null || race == "") race = sp["race"];
			row.appendChild(centerCell(race));
			row.appendChild(centerCell(restrict(sp["castingTime_zh"], 4)));
			row.appendChild(centerCell(restrict(sp["savingThrow_zh"], 11)));
			row.appendChild(centerCell(restrict(sp["spellResistance_zh"], 6)));

			table.appendChild(row);

			let tooltip = document.createElement("span");
			tooltip.className = "tooltiptext";
			tooltip.innerHTML = "loading...";
			nameCell.appendChild(tooltip);
			nameCell.onmouseenter = () => {
				if (document.body.clientWidth < 600) {
					return;
				}
				tooltip.style.visibility = "visible";
				tooltip.style.top = "10px";

				if (tooltip.innerHTML == "loading...") {
					fetch("/pathfinder/spells/" + sp["key"] + ".json").then(response => {
						if (!response.ok) {
							alert('Failed to fetch spell content.');
						}
						return response.text();
					}).then(text => {
						sp = JSON.parse(text);
						tooltip.innerHTML = "";
						loadFeat(sp, tooltip);
					}).catch(error => {
						alert('Error: ' + error.message);
						throw error;
					});
				}
			};
			nameCell.onmouseleave = () => {
				tooltip.style.visibility = "hidden";
			};
			nameCell.onclick = () => {
				window.open("spell.html?spell=" + sp["key"]);
			};
		}
	}
	tableDiv.appendChild(table);
}
document.onkeyup = (event) => {
	if (event.key == "Enter") {
		search();
	}
};