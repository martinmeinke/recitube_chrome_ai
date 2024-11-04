# recitube chrome extension

Yay, on-device AI!!!

Test device ai
```js
const model = await window.ai.assistant.create()
await model.prompt("Whats up");
```

Extract yt transcript
```js
const model = await window.ai.assistant.create()

function openTranscript() {
    const moreActionsButton = document.querySelector('tp-yt-paper-button[id=expand]');
    if (moreActionsButton) {
        moreActionsButton.click();
        // Wait for the "Show transcript" button to appear
        setTimeout(() => {
            const transcriptButton =  document.querySelector('button[aria-label="Show transcript"]');
            if (transcriptButton) {
                transcriptButton.click();
                // Wait for the transcript content to load
                setTimeout(extractTranscriptText, 2000);
            } else {
                console.log("Transcript button not found or unavailable for this video.");
            }
        }, 1000);
    } else {
        console.log("More actions button not found.");
    }
}

// Function to extract the transcript text once it’s open
function extractTranscriptText() {
    const transcriptContainer = document.querySelector('ytd-transcript-renderer');
    if (transcriptContainer) {
        const segments = transcriptContainer.querySelectorAll('yt-formatted-string.ytd-transcript-segment-renderer');
        const transcriptText = [...segments].map(segment => segment.innerText).join(' ');
        console.log(transcriptText);  // Replace with desired handling of the text
        await model.prompt("Please return a list of all cooking ingredients from this video transcript: " + transcriptText);
    } else {
        console.log("Transcript content not found.");
    }
}

// Run the function to open and extract the transcript
openTranscript();
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details