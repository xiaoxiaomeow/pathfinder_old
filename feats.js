function connect(content, connector, translation) {
    let str = "";
    for (key in content) {
        let cur = content[key];
        str += (translation[cur] ?? cur) + connector;
    }
    return str.substring(0, str.length - connector.length);
}
function getTranslatedSource (sp) {
    let sourceTrans = "";
    for (key in sp["source"]) {
        let cur = sp["source"][key].split(" pg.")[0];
        sourceTrans += (translations.sourceTranslations[cur] ?? cur) + ", ";
    }
    return sourceTrans.substring(0, sourceTrans.length - 2);
}
function getSimpTranslatedSource (sp) {
    if (sp["source"].length == 1) {
        return getTranslatedSource(sp);
    }
    for (key in sp["source"]) {
        let cur = translations.sourceTranslations[sp["source"][key].split(" pg.")[0]];
        if (!cur.includes("-")) {
            return cur + " ...";
        }
    }
    for (key in sp["source"]) {
        let cur = translations.sourceTranslations[sp["source"][key].split(" pg.")[0]];
        if (cur.includes("PCS") || cur.includes("PPC")) {
            return cur + " ...";
        }
    }
    for (key in sp["source"]) {
        let cur = translations.sourceTranslations[sp["source"][key].split(" pg.")[0]];
        return cur + " ...";
    }
    return "";
}
function markTree (key, tree, mark) {
	let relavant = false;
	for (i in tree) {
		let node = tree[i];
		if (mark) {
			node["marked"] = true;
			markTree(key, node["children"], true);
		}
		if (node["key"] == key) {
			node["marked"] = true;
			node["force"] = true;
			markTree(key, node["children"], true);
			relavant = true;
		} else {
			if (markTree(key, node["children"], false)) {
				node["marked"] = true;
				node["force"] = true;
				relavant = true;
			}
		}
	}
	return relavant;
}
function printTree (tree, key, indent) {
	let str = "";
	for (i in tree) {
		let node = tree[i];
		if (node["marked"]) {
			let ft = featDict[node["key"]];
			let name = getTitle(ft, false);
			if (node["key"] != key) {
				str += indent + "<a style=\"color:gray\" href=\"feat.html?feat=" + node["key"] + "\">" + name + "</a>";
			} else {
				str += indent + "<a>" + name + "</a>";
			}
			str += "<br>" + printTree(node["children"], key, indent + "&#12288;");
		}
	}
	return str;
}
function buildFeatTree (key) {
	let tree = JSON.parse(JSON.stringify(featTree));
	markTree(key, tree);
	return printTree(tree, key, "");
}
function getTitle (ft, withLink = true) {
	let en_name = withLink ? ("<a href=\"" + ft["url"] + "\">" + ft["name"] + "</a>") : ft["name"];
    let name = (ft["name_zh"] != null) ? (ft["name_zh"] + " (" + en_name + ")") : en_name;
    if (ft["race_zh"] != null) {
        name += " [" + ft["race_zh"] + "]";
    }
    name += " <sup>" + getTranslatedSource(ft) + "</sup>";
	return name;
}
function loadFeat(ft, div, containSource = false) {
	let sources = {};
	for (k in featDict) {
		let source = getTranslatedSource(featDict[k]).split(", ");
		for (sk in source) {
			sources[source[sk].split("-")[0]] = "";
		}
	}
	console.log(sources);

    div.innerHTML = "";

	if (containSource) {
		div.appendChild(getTopBar());
		window.top.document.title = ft["name_zh"] ?? ft["name"];
		$(div).append($("<hr>"));
	}

    // title
    let name = getTitle(ft);
	// descriptors
	let descriptors = ft["descriptors"];
	if (descriptors != null) {
		name += "〔" + connect(descriptors, ", ", translations.featDescriptorsTranslations) + "〕";
	}
    $(div).append($("<h3>" + name + "</h3>"));

    // other
    if (ft["description_zh"] != null) $(div).append($("<p>" + ft["description_zh"] + "</p>"));
	else if (ft["description"] != null) $(div).append($("<p>" + ft["description"] + "</p>"));
    if (ft["prerequisites_zh"] != null) $(div).append($("<p><b>先决条件: </b>" + ft["prerequisites_zh"] + "</p>"));
	else if (ft["prerequisites"] != null) $(div).append($("<p><b>先决条件: </b>" + ft["prerequisites"] + "</p>"));
    if (ft["benefit_zh"] != null) $(div).append($("<p><b>专长效果: </b>" + ft["benefit_zh"] + "</p>"));
	else if (ft["benefit"] != null) $(div).append($("<p><b>专长效果: </b>" + ft["benefit"] + "</p>"));
    if (ft["normal_zh"] != null) $(div).append($("<p><b>通常状况: </b>" + ft["normal_zh"] + "</p>"));
	else if (ft["normal"] != null) $(div).append($("<p><b>通常状况: </b>" + ft["normal"] + "</p>"));
    if (ft["special_zh"] != null) $(div).append($("<p><b>特殊说明：</b>" + ft["special_zh"] + "</p>"));
	else if (ft["special"] != null) $(div).append($("<p><b>特殊说明：</b>" + ft["special"] + "</p>"));

    // source
    let sourceStr = "";
    for (key in ft["source"]) {
        sourceStr += "<br>" + ft["source"][key];
    }
    $(div).append($("<p><b>出处</b>" + sourceStr + "</p>"));

	// stamina
	if (ft["staminaText_zh"] != null || ft["staminaText"] != null) {
		$(div).append($("<hr><h4>战策</h4></div>"));
		if (ft["staminaText_zh"] != null) $(div).append($("<p>" + ft["staminaText_zh"] + "</p>"));
		else if (ft["staminaText"] != null) $(div).append($("<p>" + ft["staminaText"] + "</p>"));
		$(div).append($("<p><b>出处</b><br>" + ft["staminaSource"] + "</p>"));

	}

	// mythic version
	if (ft["mythicBenefit_zh"] != null || ft["mythicBenefit"] != null) {
		$(div).append($("<hr><h4>神话版本</h4>"));
		if (ft["mythicDescription_zh"] != null) $(div).append($("<p>" + ft["mythicDescription_zh"] + "</p>"));
		else if (ft["mythicDescription"] != null) $(div).append($("<p>" + ft["mythicDescription"] + "</p>"));
		if (ft["mythicPrerequisites_zh"] != null) $(div).append($("<p><b>先决条件: </b>" + ft["mythicPrerequisites_zh"] + "</p>"));
		else if (ft["mythicPrerequisites"] != null) $(div).append($("<p><b>先决条件: </b>" + ft["mythicPrerequisites"] + "</p>"));
		if (ft["mythicBenefit_zh"] != null) $(div).append($("<p><b>专长效果: </b>" + ft["mythicBenefit_zh"] + "</p>"));
		else if (ft["mythicBenefit"] != null) $(div).append($("<p><b>专长效果: </b>" + ft["mythicBenefit"] + "</p>"));
		if (ft["mythicNormal_zh"] != null) $(div).append($("<p><b>通常状况: </b>" + ft["mythicNormal_zh"] + "</p>"));
		else if (ft["mythicNormal"] != null) $(div).append($("<p><b>通常状况: </b>" + ft["mythicNormal"] + "</p>"));
		if (ft["mythicSpecial_zh"] != null) $(div).append($("<p><b>特殊说明：</b>" + ft["mythicSpecial_zh"] + "</p>"));
		else if (ft["mythicSpecial"] != null) $(div).append($("<p><b>特殊说明：</b>" + ft["mythicSpecial"] + "</p>"));
		$(div).append($("<p><b>出处</b><br>" + ft["mythicSource"] + "</p>"));
	}

	// feat tree
	$(div).append($("<hr>"));
	$(div).append($("<p><b>专长树</b><br></p>"));
	$(div).append($("<p>" + buildFeatTree(ft["key"]) + "</p>"));
    
}
function loadUrlFeat() {
    let key = urlAttributes["feat"];
	key = key.toLowerCase();
    fetch("/pathfinder/feats/" + key + ".json").then(response => {
        if (response.ok) {
			return response.text();
        } else {
			return null;
		}
    }).then(text => {
		if (text != null) {
			ft = JSON.parse(text);
			loadFeat(ft, document.getElementById("box"), true);
		}
    }).catch(error => {
        console.log(error);
    });
}
function addBoxes(dict, element, array, nonempty = false, check = true, sort = true) {
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

}
var descriptorsBoxes = [];
var sourceBoxes = [];
var translations;
function loadTransAndSearchElements () {
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

        addBoxes(translations.featDescriptorsTranslations, document.getElementById("descriptors"), descriptorsBoxes);
		addBoxes(["CRB", "Bst", "APG", "UM", "UC", "ARG", "UCa", "MA", "MC", "Uch", "OA", "ACG", "UI", "HA", "VC", "AG", "BotD", "UW", "PA", "AP", "PCS", "PPC", "Mod", "other"], document.getElementById("source"), sourceBoxes, true, true, false);
    }).catch(error => {
        console.log(error);
    });
}
function loadTransAndUrlSpell () {
	fetch ("/pathfinder/script/translations.json").then(response => {
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
function sourceLegal (ft) {
	let source = ft["source"];
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
	return source_legal;
}
function featLegal (ft) {
	let name = document.getElementById("name").value;
	let name_legal = (ft["name_zh"] != null && ft["name_zh"].includes(name)) || (ft["name"] != null && ft["name"].toLowerCase().includes(name.toLowerCase()));

	let descriptors = ft["descriptors"];
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

	let source_legal = sourceLegal(ft);

	let legal = (name != "" && name_legal) || (name == "" && descriptors_legal && source_legal);
	return legal;
}
function populateFeat (ft, table, indent, gray) {
	let row = document.createElement("tr");
	let div = document.createElement("div");
	div.innerHTML = indent;
	let nameCell = cell(ft["name_zh"] ?? ft["name"]);
	if (gray) {
		nameCell.style.color = "gray";
	}
	nameCell.className = "tooltip";
	div.appendChild(nameCell);
	row.appendChild(div);
	row.appendChild(centerCell(connect(ft["descriptors"], ", ", translations.featDescriptorsTranslations)));
	row.appendChild(centerCell(getSimpTranslatedSource(ft)));

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
			fetch("/pathfinder/feats/" + ft["key"] + ".json").then(response => {
				if (!response.ok) {
					alert('Failed to fetch feat content.');
				}
				return response.text();
			}).then(text => {
				ft = JSON.parse(text);
				tooltip.innerHTML = "";
				loadFeat(ft, tooltip);
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
		window.open("feat.html?feat=" + ft["key"]);
	};
}
function populateTree (table, tree, indent) {
	for (i in tree) {
		let node = tree[i];
		if (node["marked"]) {
			let ft = featDict[node["key"]];
			if (sourceLegal(ft) || node["force"]) {
				populateFeat(ft, table, indent, !featLegal(ft));
			}
			populateTree(table, node["children"], indent + "&#12288;");
		}
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
    title.innerHTML = "<th>专长</th><th>描述符</th><th>出处</th>"
    table.appendChild(title);
	let showTree = document.getElementById("showTree").checked;
	if (showTree) {
		let tree = JSON.parse(JSON.stringify(featTree));
		for (key in featDict) {
			let ft = featDict[key];
			if (featLegal(ft)) {
				markTree(key, tree, false);
			}
		}
		populateTree(table, tree, "");
	} else {
		for (key in featDict) {
			let ft = featDict[key];
			if (featLegal(ft)) {
				populateFeat(ft, table, "", false);
			}
		}
	}
    tableDiv.appendChild(table);
}
document.onkeyup = (event) => {
    if (event.key == "Enter") {
        search();
    }
};