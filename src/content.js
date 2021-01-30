try { var browser = chrome } catch { }

browser.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request.message == "passe") {

            let [found, source] = getSource()
            console.log("Source:", source)
            let url = document.URL
            sendResponse({ found, source, url })

            return true
        }
    }
)
const getSource = () => {

    let source = ""
    const clear = (s) => {
        return s.split('?')[0].split('#')[0]
    }
    try {
        let innerHTML = document.body.innerHTML
        source = clear(innerHTML.split("player.vimeo.com/video/")[1].split('"')[0])
    } catch {
        try {
            for (let i of document.getElementsByTagName("iframe")) {
                let s = clear(i.src)
                if (s.split('/').slice(0, -1).join('/').length == 9) {
                    source = s.slice(-1)[0]
                }
            }
        } catch { }
        if (!source) {
            console.log("Not found error")
            return [false, ""]
        }
    }

    if (source.length != 9) { //May need enhancement
        console.log("Wrong size, no error")
        return [false, ""]
    }
    console.log('fine')
    return [true, source]
}