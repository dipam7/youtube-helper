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
    else if (request.action === "getTranscript") {
        const transcriptResult = getVideoTranscript();
        
        // Handle both sync and async results
        if (transcriptResult instanceof Promise) {
            transcriptResult.then(result => {
                sendResponse(result);
            });
            return true; // Keep message channel open for async response
        } else {
            sendResponse(transcriptResult);
        }
    }
    return true; // Keeps the message channel open for async responses
});

// Add this function to content.js
function getVideoTranscript() {
    // YouTube stores transcripts in a specific panel
    // First, check if transcript button exists and click it if needed
    const transcriptButton = document.querySelector('button[aria-label="Show transcript"]');
    
    if (!transcriptButton) {
        return { available: false, message: "No transcript button found" };
    }
    
    // Click to open transcript panel if not already open
    const transcriptPanel = document.querySelector('ytd-transcript-segment-list-renderer');
    if (!transcriptPanel) {
        transcriptButton.click();
        // Need to wait for panel to load - returning promise for async handling
        return new Promise((resolve) => {
            // Wait for panel to appear in DOM
            setTimeout(() => {
                const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
                if (segments.length === 0) {
                    resolve({ available: false, message: "No transcript segments found" });
                    return;
                }
                
                const transcript = extractTranscriptData(segments);
                resolve({ available: true, transcript });
            }, 1000); // Give time for transcript to load
        });
    } else {
        // Panel already open, extract data
        const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
        if (segments.length === 0) {
            return { available: false, message: "No transcript segments found" };
        }
        
        const transcript = extractTranscriptData(segments);
        return { available: true, transcript };
    }
}

// Helper function to extract text and timestamps
function extractTranscriptData(segments) {
    const transcriptData = [];
    
    segments.forEach(segment => {
        const timeElement = segment.querySelector('.segment-timestamp');
        const textElement = segment.querySelector('.segment-text');
        
        if (timeElement && textElement) {
            const timestamp = timeElement.textContent.trim();
            const text = textElement.textContent.trim();
            
            // Convert timestamp (e.g., "0:34") to seconds for easier analysis
            const seconds = convertTimestampToSeconds(timestamp);
            
            transcriptData.push({
                timestamp,
                seconds,
                text
            });
        }
    });
    
    return transcriptData;
}

// Convert timestamp string to seconds
function convertTimestampToSeconds(timestamp) {
    const parts = timestamp.split(':').map(part => parseInt(part, 10));
    
    if (parts.length === 3) { // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) { // MM:SS
        return parts[0] * 60 + parts[1];
    }
    
    return 0; // Default fallback
}