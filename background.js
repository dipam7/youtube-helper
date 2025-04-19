// background.js
// Listen for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Check if the URL contains youtube.com/watch
    if (tab.url && tab.url.includes('youtube.com/watch')) {
        // If we're at YouTube and the page is completely loaded
        if (changeInfo.status === 'complete') {
            console.log("On YouTube video page!");
            
            // Here we could inject a content script or perform other actions
            chrome.tabs.sendMessage(tabId, {
                action: "youtubePageLoaded",
                url: tab.url
            });
        }
    }
});