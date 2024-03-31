var urlAttributes = {};
function onLoad () {
    let url = window.location.search;
    if (url.length > 0) {
        url = url.substring(1);
        let array = url.split('&');
        for (i in array) {
            let item = array[i].split('=');
            urlAttributes[item[0]] = item[1];
        }
    }
}
onLoad();
function getTopBar () {
	let div = document.createElement("div");
	div.style.display = "flex";
	$(div).append($("<a href=\"spells.html\">法术查询</a>"));
	$(div).append($("<div>&#12288;</div>"));
	$(div).append($("<a href=\"feats.html\">专长查询</a>"));
	return div;
}
function addTopBar () {
	document.getElementById("topBar").appendChild(getTopBar());
}