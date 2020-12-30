chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request.message == "passe") {
            console.log("copy")
            source_found = getSource()
            console.log("Source:", source_found)
            if (source_found === "") {
                sendResponse({ stuff: "Not found" })
                return
            }
            let results = {}
            chrome.runtime.sendMessage({ source: source_found}, res => {
                
                results = res.output
                console.log(results)
                sendResponse({ stuff: results })
            })
            return true
        }
    }
)
const getSource = () => {
    let all_ = document.body.innerHTML
    let out = all_.split("https://player.vimeo.com/video/")[1].split('"')[0]
    if (out.length != 9) {
        return ""
    }
    return out
}