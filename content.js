// content.js
console.log("YouTube Helper content script loaded");

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getVideoInfo") {
        const videoTitle = document.querySelector('h1.title.style-scope.ytd-video-primary-info-renderer')?.textContent || 
                         document.querySelector('h1.watch-title')?.textContent ||
                         "Video title not found";
        
        sendResponse({
            title: videoTitle.trim(),
            url: window.location.href
        });
    }
    return true; // Keeps the message channel open for async responses
});