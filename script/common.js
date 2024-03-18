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