
try { var browser = chrome } catch { }

/*
Test data
379454037
https://fireship.io/
*/
function check_status_code(response) {

    if (!response.ok) (console.warn(`${url} returned wrong status code: ${response.status}`));
    return response.text();

}

/* Parsing */
const vimeo_JSON = (part) => {

    //Locate JSON in response and Convert from Vimeo WebPage
    let located_json = part.split('"};')[0].split('= {"')[1];
    let cleared_json = JSON.parse(`{"${located_json}"}`);

    return cleared_json;
}
const get_videos = (cleared_JSON) => {
    let direct_links = [];
    for (var _ = 0; _ < cleared_JSON.request.files.progressive.length; _++) {
        let top = cleared_JSON.request.files.progressive[_]

        let new_vid = {}
        new_vid.quality = top.quality
        new_vid.url = top.url

        direct_links.push(new_vid);
    }
    return direct_links;
}

browser.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request.source) {
            console.log("copy that", request)
            const url = `https://player.vimeo.com/video/${request.source}`

            fetch(url)
                .then(check_status_code)
                .then(function (res) {

                    //Locate part of response containing mp4s
                    let output = {}
                    const cleared_JSON = vimeo_JSON(res);
                    console.log(cleared_JSON)

                    //Store interesting data
                    const all_videos = get_videos(cleared_JSON);
                    const title = cleared_JSON.video.title
                    const owner = cleared_JSON.video.owner
                    const privacy = cleared_JSON.video.privacy

                    output = { all_videos, title, owner, privacy }

                    sendResponse({ output })
                })
                .catch(function (err) {
                    console.error(`${err} :: ${url}`);
                })
            return true
        }
    })