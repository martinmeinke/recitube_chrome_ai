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
        transcriptText = [...segments].map(segment => segment.innerText).join(' ');
        console.log("Transcript text:", transcriptText);

        const MAX_TRANSCRIPT_LENGTH = 2000;
        transcriptText = transcriptText.substring(0, MAX_TRANSCRIPT_LENGTH);
        
        try {
            const model = await initializeAI();
            if (model) {
                const PROMPT_TEMPLATE = `This is the youtube transcript of a recipe video: ${transcriptText}
                It might contain one or multiple recipes. I want you to list all ingredients, recipe by recipe, such that i can easily search for them online.
                Please list just the recipe title and ingredients, no amounts needed. Please return just the plain ingredient info.
                Your output must always be only JSON , here is an example response:
                
                {{[{"name": "Tuna with rice", "ingredients": ["Tuna", "Rice"]},{"name": "Broccoli with garlic", "ingredients": ["garlic", "broccoli"]}]}}
                
                Under no circumstances return any preamble or explanations. Start your output with [ and end with ].
                Don't output any newlines`;
                console.log("PROMPT_TEMPLATE", PROMPT_TEMPLATE);
                response = await model.prompt(PROMPT_TEMPLATE);
                response = response.trim();
                console.log("AI Response:", response);
                
                // Parse the response into an array of ingredients
                try {
                    if(response.startsWith("```json")) {
                        response = response.substring(7, response.length-3);
                    }

                    const parsedResponse = JSON.parse(response);
                    console.log("Recipe data sent to background script:", parsedResponse);
                    chrome.runtime.sendMessage({
                        type: 'ingredientsForSidePanel',
                        recipes: parsedResponse
                    }).catch(error => {
                        console.log('Error sending message:', error);
                    });
                } catch (error) {
                    console.error("Error parsing AI response:", error);
                }
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
                }, 500);
            } else {
                console.log("Transcript button not found or unavailable for this video.");
            }
        }, 500);
    } else {
        console.log("More actions button not found.");
    }
}
