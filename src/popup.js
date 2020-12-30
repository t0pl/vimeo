chrome.tabs.query({active:true, currentWindow:true}, (tab)=>{
    chrome.tabs.sendMessage(tab[0].id, {message:"passe"}, res=>{
        console.log(res.stuff)
    })
})