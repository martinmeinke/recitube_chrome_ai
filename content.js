// Add custom logger at the top of your file
const logger = {
    prefix: '[Recitube]',
    log: (...args) => console.log(logger.prefix, ...args),
    error: (...args) => console.error(logger.prefix, ...args),
    info: (...args) => console.info(logger.prefix, ...args),
    warn: (...args) => console.warn(logger.prefix, ...args)
};

// Listen for message from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractTranscript") {
        chrome.runtime.sendMessage({ type: 'processingStarted' });
        openTranscript();
    }
});

async function initializeAI() {
    try {
        const model = await window.ai.assistant.create();
        return model;
    } catch (error) {
        logger.error("Error initializing AI:", error);
        return null;
    }
}

async function extractTranscriptText() {
    const transcriptContainer = document.querySelector('ytd-transcript-renderer');
    if (transcriptContainer) {
        const segments = transcriptContainer.querySelectorAll('yt-formatted-string.ytd-transcript-segment-renderer');
        transcriptText = [...segments].map(segment => segment.innerText).join(' ');
        logger.log("Transcript text:", transcriptText);

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
                logger.log("PROMPT_TEMPLATE", PROMPT_TEMPLATE);
                response = await model.prompt(PROMPT_TEMPLATE);
                response = response.trim();
                logger.log("AI Response:", response);
                
                // Parse the response into an array of ingredients
                try {
                    if(response.startsWith("```json")) {
                        response = response.substring(7, response.length-3);
                    }

                    const parsedResponse = JSON.parse(response);
                    logger.log("Recipe data sent to background script:", parsedResponse);
                    chrome.runtime.sendMessage({
                        type: 'ingredientsForSidePanel',
                        recipes: parsedResponse
                    }).catch(error => {
                        logger.log('Error sending message:', error);
                    });
                } catch (error) {
                    logger.error("Error parsing AI response:", error);
                }
            }
        } catch (error) {
            logger.error("Error processing with AI:", error);
            chrome.runtime.sendMessage({ type: 'error', error: 'AI Error' });
        }
    } else {
        logger.log("Transcript content not found.");
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
                        logger.error("Error in extractTranscriptText:", error);
                    });
                }, 1000);
            } else {
                logger.log("Transcript button not found or unavailable for this video.");
            }
        }, 1000);
    } else {
        logger.log("More actions button not found.");
    }
}
