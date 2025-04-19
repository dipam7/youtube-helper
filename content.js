// content.js
console.log("Soccer Highlights Analyzer loaded");

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getVideoInfo") {
        // Get video title
        const videoTitle = document.querySelector('h1.title.style-scope.ytd-video-primary-info-renderer')?.textContent?.trim() || 
                         document.querySelector('h1.watch-title')?.textContent?.trim() ||
                         "Video title not found";
        
        // Get video description - simpler approach
        let videoDescription = "Description not found";
        // Try multiple possible selectors for the description
        const descriptionSelectors = [
            '#description-inline-expander', 
            '#description', 
            '#info #description',
            '#meta #description',
            'ytd-expandable-video-description-body-renderer',
            '.ytd-video-secondary-info-renderer #description'
        ];

        // Try each selector until we find something
        for (const selector of descriptionSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                videoDescription = element.textContent.trim();
                console.log("Found description with selector:", selector);
                break;
            }
        }

        // Print what we found for debugging
        console.log("Final description value:", videoDescription);
                
        // Get video duration 
        let videoDuration = "0:00";
        const durationElement = document.querySelector('.ytp-time-duration');
        if (durationElement) {
            videoDuration = durationElement.textContent;
        }
        
        // Convert duration to minutes
        const durationParts = videoDuration.split(':').map(part => parseInt(part, 10));
        let totalMinutes = 0;
        
        if (durationParts.length === 3) { // HH:MM:SS format
            totalMinutes = durationParts[0] * 60 + durationParts[1];
        } else if (durationParts.length === 2) { // MM:SS format
            totalMinutes = durationParts[0];
        }
        
        // Log the extracted information for debugging
        console.log({
            title: videoTitle,
            description: videoDescription,
            duration: videoDuration,
            durationMinutes: totalMinutes,
            url: window.location.href
        });
        
        sendResponse({
            title: videoTitle,
            description: videoDescription,
            duration: videoDuration,
            durationMinutes: totalMinutes,
            url: window.location.href
        });
    }
    return true; // Keeps the message channel open for async responses
});