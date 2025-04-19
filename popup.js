// popup.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on YouTube
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const isYouTube = currentTab.url.includes('youtube.com/watch');
        
        if (isYouTube) {
            document.getElementById('not-youtube').style.display = 'none';
            document.getElementById('video-info').style.display = 'block';
            
            // Request video info from content script
            chrome.tabs.sendMessage(currentTab.id, {action: "getVideoInfo"}, function(response) {
                if (response) {
                    // Update UI with video information
                    document.getElementById('video-title').textContent = response.title;
                    document.getElementById('video-duration').textContent = response.duration + 
                        ` (${response.durationMinutes} minutes)`;
                    document.getElementById('video-description').textContent = response.description;
                    
                    // Store response for later use
                    window.videoData = response;
                    
                    // Enable/disable the analyze button based on video duration
                    const analyzeButton = document.getElementById('analyze-button');
                    if (response.durationMinutes > 20) {
                        analyzeButton.textContent = "Video too long (>20 min)";
                        analyzeButton.disabled = true;
                    } else {
                        analyzeButton.textContent = "Analyze Soccer Highlights";
                        analyzeButton.disabled = false;
                    }
                } else {
                    document.getElementById('video-title').textContent = "Couldn't get video info";
                    document.getElementById('video-duration').textContent = "Unknown";
                    document.getElementById('video-description').textContent = "Not available";
                }
            });
            
            // Set up analyze button
            document.getElementById('analyze-button').addEventListener('click', function() {
                if (!window.videoData) return;
                
                document.getElementById('status').textContent = "Analyzing video...";
                
                // This is a placeholder for the Gemini API call
                // We'll implement this in the next step
                document.getElementById('status').textContent = "Gemini API not implemented yet";
            });
        } else {
            document.getElementById('not-youtube').style.display = 'block';
            document.getElementById('video-info').style.display = 'none';
        }
    });
});