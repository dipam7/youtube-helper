# Soccer Highlights Analyzer

> A Chrome extension that identifies soccer highlight videos on YouTube and extracts goal timestamps.

![some text](image.png)

## Current Status

This extension is currently under development. It can:

1. Extract video information from YouTube pages:
   - Title
   - Duration
   - Description

2. Check if the video is under 20 minutes (to focus on highlight reels)

3. Call the Claude API to analyze if the content is likely a soccer highlights video
   - Uses a simple TRUE/FALSE prompt to classify video content
   - Limits description text to first 500 characters for better API performance

## In Progress

- Secure API key storage implementation
- Video transcript extraction

## Future Plans

- Extract video transcripts and timestamps
- Analyze transcripts to identify goal moments
- Format goal timestamps for easy sharing in comments
- Copy formatted timestamps to clipboard
- Add better error handling and user feedback
- Support more languages and soccer terminology

## Installation

### Prerequisites

- Google Chrome browser
- Claude API key (get one at https://console.anthropic.com/)

### Development Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/soccer-highlights-analyzer.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top-right corner)

4. Click "Load unpacked" and select the repository folder

5. The extension should now appear in your Chrome toolbar

### Usage

1. Navigate to a YouTube video
2. Click the extension icon
3. The extension will display the video title, duration, and description
4. If the video is under 20 minutes, you can click "Analyze Soccer Highlights"
5. The extension will use Claude to determine if it's a soccer highlights video

## Implementation Details

The extension consists of:

- **manifest.json**: Extension configuration with permissions for YouTube and Claude API
- **popup.html/js**: UI that appears when clicking the extension icon
- **content.js**: Script that extracts data from YouTube pages
- **background.js**: Background service worker that handles events
- **options.html/js**: Settings page for storing API key (planned)

## Development

### API Key Security

Currently, the API key is hardcoded for testing purposes. This will be replaced with a proper storage system using Chrome's storage API.

### Video Classification

The Claude API is used to determine if a video is a soccer highlights video based on:
- Video title
- Video description (first 500 characters)

### Transcript Extraction (Planned)

YouTube transcript extraction is the next development goal.

## Contributing

This project is in early development. Contributions welcome!

## License

MIT License