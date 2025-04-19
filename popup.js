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
                analyzeVideoWithGemini(window.videoData);
            });
        } else {
            document.getElementById('not-youtube').style.display = 'block';
            document.getElementById('video-info').style.display = 'none';
        }
    });
    
    // Function to call Gemini API for video analysis
    function analyzeVideoWithGemini(videoData) {
        // You would normally get this from storage, but since you have it in your environment
        // For demo purposes, we'll hardcode this, but in a real extension you would store it securely
        const apiKey = "GEMINI_API_KEY"; // Replace with actual key or use chrome.storage.sync to get it
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        
        const prompt = `
            Analyze this YouTube video information and determine if it's a soccer highlights video.
            Only respond with "TRUE" or "FALSE".
            
            Title: ${videoData.title}
            Duration: ${videoData.duration} (${videoData.durationMinutes} minutes)
            Description: ${videoData.description}
            
            If you're confident this is a soccer highlights video, respond with "TRUE".
            Otherwise, respond with "FALSE".
        `;
        
        // Make the API call
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Gemini API response:", data);
            
            try {
                // Extract the response text
                const responseText = data.candidates[0].content.parts[0].text.trim();
                console.log("Gemini response text:", responseText);
                
                // Check if it's a soccer highlights video
                if (responseText.includes("TRUE")) {
                    document.getElementById('status').textContent = "This is a soccer highlights video! Analyzing for goal timestamps...";
                    // In the next step, we'll add code to extract and analyze transcripts
                } else {
                    document.getElementById('status').textContent = "This doesn't appear to be a soccer highlights video.";
                }
            } catch (error) {
                document.getElementById('status').textContent = "Error analyzing video: " + error.message;
                console.error("Error processing Gemini response:", error);
            }
        })
        .catch(error => {
            document.getElementById('status').textContent = "Error calling Gemini API: " + error.message;
            console.error("Gemini API error:", error);
        });
    }
});