/*
author:t0pl

When popup gets clicked
    popup wakes content script up
        content script retreives ID
        content script sends it back to popup
    popup fetches data
popup gets dressed up

TODO
    Handle errors
*/
try { var browser = chrome } catch { }

var headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'DNT': '1',
    'Referer': '',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
}
browser.tabs.query({ active: true, currentWindow: true }, (tab) => {

    browser.tabs.sendMessage(tab[0].id, { message: "passe" }, res => {
        if (!res.found) {
            console.log("Nothin here")
            return
        }
        console.log("Received from content.js", res, res.source)

        /*Fetch data from vimeo*/
        const url = `https://player.vimeo.com/video/${res.source}`
        window.url = res.url
        window.source = res.source
        set_referer_in_headers()

        set_listener()
        fetch(url)
            .then(check_status_code)
            .then(res => {

                //Locate JSON
                let output = {}
                const cleared_JSON = vimeo_JSON(res)
                console.log(cleared_JSON)

                //Store interesting data
                const all_videos = get_videos(cleared_JSON)
                const title = cleared_JSON.video.title
                const owner = cleared_JSON.video.owner
                const privacy = cleared_JSON.video.privacy
                const source = window.source

                output = { all_videos, title, owner, privacy, source }

                /*Display data*/
                get_dressed(output)
            })
            .catch(err => {
                console.error(`${err} :: ${url}`)
            })
            .finally(() => {
                remove_listener()
            })
        return true
    })
})

const get_dressed = (output) => {

    //Title
    document.getElementById("title").textContent = output.title
    //Source
    document.getElementById("id_").textContent = output.source
    //Videos
    let ol_tag = document.getElementById('videos')
    for (let i = 0; i < output.all_videos.length; i++) {

        let li = document.createElement('li')

        //Each video has a button with its quality on it
        let btn_open_video = document.createElement('button')
        btn_open_video.textContent = output.all_videos[i].quality

        //and leads to matching url
        btn_open_video.onclick = () => {
            browser.tabs.create({ active: true, url: output.all_videos[i].url }, tab => {

            })
        }

        //Add url as plain text next to button
        li.textContent += output.all_videos[i].url
        li.appendChild(btn_open_video)
        ol_tag.appendChild(li)
    }

    //Owner
    document.getElementById("owner_name").textContent = output.owner.name
    document.getElementById("owner_account_type").textContent = output.owner.account_type
    let owner_url = document.getElementById("owner_url")
    owner_url.textContent = output.owner.url
    owner_url.onclick = () => {
        browser.tabs.create({ active: true, url: output.owner.url }, tab => {

        })
    }

    //Privacy
    document.getElementById("privacy").textContent = output.privacy
}

const check_status_code = response => {

    if (!response.ok) (console.warn(`${url} returned wrong status code: ${response.status}`));
    return response.text();

}

/* Parsing */
const vimeo_JSON = part => {

    //Locate JSON in response and Convert from Vimeo WebPage
    let located_json = part.split('"};')[0].split('= {"')[1];
    let cleared_json = JSON.parse(`{"${located_json}"}`);

    return cleared_json;
}

const get_videos = cleared_JSON => {
    let videos = [];

    for (var _ = 0; _ < cleared_JSON.request.files.progressive.length; _++) {
        let top = cleared_JSON.request.files.progressive[_]

        let new_vid = { quality: top.quality, url: top.url }

        videos.push(new_vid);
    }
    return videos;
}

/* Header stuff */
const set_referer_in_headers = () => {
    window.headers['Referer'] = window.url;
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
    //Fired to modify request headers
    Object.keys(window.headers).forEach(function (key) {
        modify_headers(details.requestHeaders, key, window.headers[key]);
    });

    return { requestHeaders: details.requestHeaders };
}

const isFirefox = () => {
    return browser.webRequest.getSecurityInfo !== undefined
}

const OnBeforeRequestOptions = () => {
    //Options differ in Chrome/Firefox
    return isFirefox() ? ['blocking', 'requestHeaders'] : ['blocking', 'requestHeaders', 'extraHeaders']
}