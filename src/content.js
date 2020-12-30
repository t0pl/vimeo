try { var browser = chrome } catch { }

browser.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request.message == "passe") {

            let [found, source] = getSource()
            console.log("Source:", source)
            let url = document.URL
            sendResponse({ found, source, url})

            return true
        }
    }
)
const getSource = () => {

    let source = ""

    try {
        let innerHTML = document.body.innerHTML
        source = innerHTML.split("https://player.vimeo.com/video/")[1].split('"')[0].split('?')[0].split('#')[0]
    } catch {
        console.log("Not found error")
        return [false, ""]
    }

    if (source.length != 9) { //May need enhancement
        console.log("Wrong size, no error")
        return [false, ""]
    }
    console.log('fine')
    return [true, source]
}