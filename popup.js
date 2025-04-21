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

            // Replace the existing click handler with this updated one in popup.js
            document.getElementById('analyze-button').addEventListener('click', function() {
                if  (!window.videoData) return;
    
                document.getElementById('status').textContent = "Analyzing video...";
    
                // First check if it's a soccer video, then get transcript
                analyzeVideoWithClaude(window.videoData)
                    .then(isSoccerVideo => {
                        if (isSoccerVideo) {
                        // Then get the transcript
                        getTranscript();
                        }
                    })
                    .catch(error => {
                        console.error("Error in analysis:", error);
                        document.getElementById('status').textContent = 
                        "Error during analysis: " + error.message;
                    });
            });
            
            // Set up analyze button
            document.getElementById('analyze-button').addEventListener('click', function() {
                if (!window.videoData) return;
                
                document.getElementById('status').textContent = "Analyzing video...";
                
                // Call the Gemini API to analyze if this is a soccer highlights video
                analyzeVideoWithClaude(window.videoData);
            });
        } else {
            document.getElementById('not-youtube').style.display = 'block';
            document.getElementById('video-info').style.display = 'none';
        }
    });
    
    // Change the existing analyzeVideoWithClaude function in popup.js
function analyzeVideoWithClaude(videoData) {
    return new Promise((resolve, reject) => {
        const apiKey = "CLAUDE_API_KEY";
        const apiUrl = "https://api.anthropic.com/v1/messages";
        
        // Make the API call to Claude
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: "claude-3-haiku-20240307",
                max_tokens: 100,
                messages: [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(`API returned ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Claude API response:", data);
            
            try {
                // Extract the response text from Claude's response format
                const responseText = data.content[0].text;
                console.log("Claude response text:", responseText);
                
                // Check if it's a soccer highlights video
                if (responseText.includes("TRUE")) {
                    document.getElementById('status').textContent = "This is a soccer highlights video! Getting transcript...";
                    resolve(true); // Resolve the promise as true
                } else {
                    document.getElementById('status').textContent = "This doesn't appear to be a soccer highlights video.";
                    resolve(false); // Resolve the promise as false
                }
            } catch (error) {
                document.getElementById('status').textContent = "Error analyzing video: " + error.message;
                console.error("Error processing Claude response:", error);
                reject(error); // Reject the promise
            }
        })
        .catch(error => {
            document.getElementById('status').textContent = "Error calling Claude API: " + error.message;
            console.error("Claude API error:", error);
            reject(error); // Reject the promise
        });
    });
    }
});

// Add this new function after analyzeVideoWithClaude in popup.js
function getTranscript() {
    document.getElementById('status').textContent = "Fetching transcript...";
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getTranscript"}, function(response) {
            if (response && response.available) {
                document.getElementById('status').textContent = 
                    `Found transcript with ${response.transcript.length} segments!`;
                
                // Store transcript data for analysis
                window.transcriptData = response.transcript;
                
                // Show success and maybe add a button to continue analysis
                document.getElementById('status').textContent = 
                    `Successfully extracted ${response.transcript.length} transcript segments.`;
                
                // Here you would call the next step function to analyze the transcript
                // analyzeTranscriptForGoals(response.transcript);
            } else {
                const message = response ? response.message : "Error getting transcript";
                document.getElementById('status').textContent = 
                    `Transcript not available: ${message}`;
            }
        });
    });
}