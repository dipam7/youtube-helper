// popup.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on YouTube
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const isYouTube = currentTab.url.includes('youtube.com/watch');
        
        if (isYouTube) {
            document.getElementById('not-youtube').style.display = 'none';
            document.getElementById('video-info').style.display = 'block';
            
            // Get video title from the page
            chrome.tabs.sendMessage(currentTab.id, {action: "getVideoInfo"}, function(response) {
                if (response && response.title) {
                    document.getElementById('video-title').textContent = response.title;
                } else {
                    document.getElementById('video-title').textContent = "Couldn't get video info";
                }
            });
            
            // Set up copy button
            document.getElementById('copy-title').addEventListener('click', function() {
                const titleText = document.getElementById('video-title').textContent;
                navigator.clipboard.writeText(titleText);
                this.textContent = "Copied!";
                setTimeout(() => {
                    this.textContent = "Copy Title";
                }, 1500);
            });
        } else {
            document.getElementById('not-youtube').style.display = 'block';
            document.getElementById('video-info').style.display = 'none';
        }
    });
});