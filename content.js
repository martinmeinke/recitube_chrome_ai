// Helper delay function using regular setTimeout
function delay(ms, callback) {
    setTimeout(callback, ms);
}

// Listen for message from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractTranscript") {
        openTranscript();
    }
});

async function initializeAI() {
    try {
        const model = await window.ai.assistant.create();
        return model;
    } catch (error) {
        console.error("Error initializing AI:", error);
        return null;
    }
}

async function extractTranscriptText() {
    const transcriptContainer = document.querySelector('ytd-transcript-renderer');
    if (transcriptContainer) {
        const segments = transcriptContainer.querySelectorAll('yt-formatted-string.ytd-transcript-segment-renderer');
        const transcriptText = [...segments].map(segment => segment.innerText).join(' ');
        console.log("Transcript text:", transcriptText);
        
        try {
            const model = await initializeAI();
            if (model) {
                const response = await model.prompt("Please return a list of all cooking ingredients from this video transcript: " + transcriptText);
                console.log("AI Response:", response);
                
                // Parse the response into an array of ingredients
                const ingredients = response.split('\n')
                    .filter(line => line.trim())
                    .map(line => line.replace(/^[-•*]\s*/, '').trim());
                
                // Send ingredients to background script instead
                chrome.runtime.sendMessage({
                    type: 'ingredientsForSidePanel',
                    ingredients: ingredients
                }).catch(error => {
                    console.log('Error sending message:', error);
                });
            }
        } catch (error) {
            console.error("Error processing with AI:", error);
        }
    } else {
        console.log("Transcript content not found.");
    }
}

function openTranscript() {
    const moreActionsButton = document.querySelector('tp-yt-paper-button[id=expand]');
    if (moreActionsButton) {
        moreActionsButton.click();
        setTimeout(() => {
            const transcriptButton = document.querySelector('button[aria-label="Show transcript"]');
            if (transcriptButton) {
                transcriptButton.click();
                setTimeout(() => {
                    extractTranscriptText().catch(error => {
                        console.error("Error in extractTranscriptText:", error);
                    });
                }, 2000);
            } else {
                console.log("Transcript button not found or unavailable for this video.");
            }
        }, 1000);
    } else {
        console.log("More actions button not found.");
    }
}
