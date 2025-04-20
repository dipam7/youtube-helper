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
                
                // Call the Gemini API to analyze if this is a soccer highlights video
                analyzeVideoWithClaude(window.videoData);
            });
        } else {
            document.getElementById('not-youtube').style.display = 'block';
            document.getElementById('video-info').style.display = 'none';
        }
    });
    
    function analyzeVideoWithClaude(videoData) {
        // Update function name to reflect using Claude API
        const apiKey = "CLAUDE_API_KEY";
        
        // Claude API endpoint
        const apiUrl = "https://api.anthropic.com/v1/messages";
        
        const prompt = `
            Analyze this YouTube video information and determine if it's a soccer highlights video.
            Only respond with "TRUE" or "FALSE".
            
            Title: ${videoData.title}
            Description: ${videoData.description.substring(0, 500)}${videoData.description.length > 500 ? '...' : ''}
            
            If you're confident this is a soccer highlights video, respond with "TRUE".
            Otherwise, respond with "FALSE".
        `;
        
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
                    document.getElementById('status').textContent = "This is a soccer highlights video! Analyzing for goal timestamps...";
                    // In the next step, we'll add code to extract and analyze transcripts
                } else {
                    document.getElementById('status').textContent = "This doesn't appear to be a soccer highlights video.";
                }
            } catch (error) {
                document.getElementById('status').textContent = "Error analyzing video: " + error.message;
                console.error("Error processing Claude response:", error);
            }
        })
        .catch(error => {
            document.getElementById('status').textContent = "Error calling Claude API: " + error.message;
            console.error("Claude API error:", error);
        });
    }
});