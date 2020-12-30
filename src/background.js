
try { var browser = chrome } catch { }


function check_status_code(response) {

    if (!response.ok) (console.warn(`${url} returned wrong status code: ${response.status}`));
    return response.text();

}

/* Parsing */
const vimeo_JSON = (part) => {

    //Locate JSON in response and Convert from Vimeo WebPage
    let located_json = part.split('= {')[1];
    let cleared_json = JSON.parse(`{${located_json}}`);

    return cleared_json;
}
const direct_links = (cleared_JSON) => {
    let direct_links = [];
    for (var _ = 0; _ < cleared_JSON.request.files.progressive.length; _++) {
        direct_links.push(cleared_JSON.request.files.progressive[_].url);
    }
    return direct_links;
}

/* Header stuff */
const set_referer_in_headers = () => {
    window.headers_['Referer'] = window.url;
}

const set_listener = () => {
    browser.webRequest.onBeforeSendHeaders.addListener(
        onBeforeSendHeaders_callback, { urls: ["https://player.vimeo.com/*"] }, OnBeforeRequestOptions()
    );
}

const remove_listener = () => {
    browser.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders_callback);
}

const modify_headers = (header_array, _name, _value) => { // Credits: https://stackoverflow.com/a/11602753
    var did_set = false;
    for (var i in header_array) {
        var header = header_array[i];
        var name = header.name;
        if (name == _name) {
            header.value = _value;
            did_set = true;
        }
    }
    if (!did_set) header_array.push({ name: _name, value: _value })
}

const onBeforeSendHeaders_callback = (details) => {
    //Fired to modify request
    Object.keys(window.headers_).forEach(function (key) {
        modify_headers(details.requestHeaders, key, window.headers_[key]);
    });

    return { requestHeaders: details.requestHeaders };
}

const OnBeforeRequestOptions = () => {
    //Options differ in Chrome/Firefox
    return isFirefox() ? ['blocking', 'requestHeaders'] : ['blocking', 'requestHeaders', 'extraHeaders']
}

browser.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request.source) {
            console.log("copy that", request)
            const url = `https://player.vimeo.com/video/${request.source}`
            window.url = request.url
            set_listener();
            fetch(url)
                .then(check_status_code)
                .then(function (res) {
                    //Locate part of response containing mp4s
                    for (const part of res.split('};')) {
                        if (part.includes('.mp4')) {
                            let output = {}
                            const cleared_JSON = vimeo_JSON(part);
                            const all_mp4s_found = direct_links(cleared_JSON);
                            const title = cleared_JSON.video.title
                            const owner_name = cleared_JSON.video.owner.name
                            const owner_id = cleared_JSON.video.owner.id
                            const owner_account_type = cleared_JSON.video.owner.account_type
                            const owner_url = cleared_JSON.video.owner.url


                            output = { mp4s: all_mp4s_found, title , owner_name, owner_id, owner_url, owner_account_type}
                            console.log(output)

                            sendResponse({ output })

                            //Display results in new tab
                            //see_in_new_tab(all_mp4s_found[0])
                        }
                    }
                })
                .catch(function (err) {
                    console.error(`${err} :: ${url}`);
                }).finally(() => remove_listener());
        }
    })