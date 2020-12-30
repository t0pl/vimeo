/*
author:t0pl
When popup gets clicked
    wake content script up
        retreives ID
        asks background to fetch data
        background sends data back to content script
    content script send it back to popup
popup gets dressed up

TODO
    Remove background script, as popup is old enough to fetch data on its own
    Handle errors
*/
chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
    chrome.tabs.sendMessage(tab[0].id, { message: "passe" }, res => {
        console.log(res, res.stuff)
        //Title
        document.getElementById("title").textContent = res.stuff.title

        //Videos
        let ol_tag = document.getElementById('videos')
        for (let i = 0; i < res.stuff.all_videos.length; i++) {

            let li = document.createElement('li')
            let btn_open_video = document.createElement('button')
            btn_open_video.textContent = res.stuff.all_videos[i].quality
            btn_open_video.onclick = () =>{
                chrome.tabs.create({active:true, url:res.stuff.all_videos[i].url}, tab=>{

                })
            }
            li.textContent += res.stuff.all_videos[i].url
            li.appendChild(btn_open_video)
            ol_tag.appendChild(li)
        }

        //Owner
        document.getElementById("owner_name").textContent = res.stuff.owner.name
        document.getElementById("owner_account_type").textContent = res.stuff.owner.account_type
        let owner_url = document.getElementById("owner_url")
        owner_url.textContent = res.stuff.owner.url
        owner_url.onclick = () =>{
            chrome.tabs.create({active:true, url:res.stuff.owner.url}, tab=>{

            })
        }


        //Privacy
        document.getElementById("privacy").textContent = res.stuff.privacy
    })
})
