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

function getDescriptionText() {
    const descriptionContainer = document.querySelector('#description-inline-expander');
    let descriptionText = "";
    if (descriptionContainer) {
        const segments = descriptionContainer.querySelectorAll('.yt-core-attributed-string--link-inherit-color');
        descriptionText = [...segments].map(segment => segment.innerText).join(' ');
        logger.log("description text:", descriptionText);

        const MAX_DESCRIPTION_LENGTH = 1000;
        descriptionText = descriptionText.substring(0, MAX_DESCRIPTION_LENGTH);
    } else {
        chrome.runtime.sendMessage({ type: 'error', error: 'Could not find video description' });
        logger.error("Description container not found.");
    }
    return descriptionText;
}

function getTranscriptText() {
    const transcriptContainer = document.querySelector('ytd-transcript-renderer');
    let transcriptText = "";
    if (transcriptContainer) {
        const segments = transcriptContainer.querySelectorAll('yt-formatted-string.ytd-transcript-segment-renderer');
        transcriptText = [...segments].map(segment => segment.innerText).join(' ');
        logger.log("Transcript text:", transcriptText);

        const MAX_TRANSCRIPT_LENGTH = 2000;
        transcriptText = transcriptText.substring(0, MAX_TRANSCRIPT_LENGTH);
        return transcriptText;
    } else {
        chrome.runtime.sendMessage({ type: 'error', error: 'Could not find video transcript' });
        logger.error("Transcript container not found.");
    }
    return null;
}

function isValidJSON(jsonString) {
    try {
        JSON5.parse(jsonString);
        return true; // Valid JSON
    } catch (error) {
        return false; // Invalid JSON
    }
}

function parseLLMResponse(response) {
    if (response.startsWith("```json")) {
        response = response.substring(7, response.length - 3);
    }
    console.log("trying to parse response:", response);
    if (isValidJSON(response)) {
        return JSON5.parse(response);
    } else {
        logger.error("Invalid JSON response from LLM");
        return null;
    }
}

async function extractIngredientListFromDescription(model, descriptionText) {
    const PROMPT_TEMPLATE = `This is the description of a youtube recipe video: ${descriptionText}
    It may or may NOT contain ingredient lists for the recipes in the video. If it does not contain explicit ingredient
    lists, you should return an empty array. If it does, you should list all ingredients, recipe by recipe, such that i can easily search for them online.
    Please list just the recipe title and ingredients, no amounts needed. Please return just the plain ingredient info.
    Your output must always be only JSON , here is an example response:
    [{"name": "Tuna with rice", "ingredients": ["Tuna", "Rice"]},{"name": "Broccoli with garlic", "ingredients": ["garlic", "broccoli"]}]
    Under no circumstances return any preamble or explanations. Start your output with [ and end with ].
    Don't output any newlines
    If the description does not contain any recipes, return: []`;

    logger.log("PROMPT_TEMPLATE", PROMPT_TEMPLATE);
    var response = await model.prompt(PROMPT_TEMPLATE);
    logger.log("AI Response:", response);
    response = response.trim();

    return parseLLMResponse(response);
}

async function extractIngredientListFromTranscript(model, transcriptText) {
    const PROMPT_TEMPLATE = `This is the transcript of a youtube recipe video: ${transcriptText}
    It might contain one or multiple recipes. I want you to list all ingredients, recipe by recipe, such that i can easily search for them online.
    Please list just the recipe title and ingredients, no amounts needed. Please return just the plain ingredient info.
    Your output must always be only JSON , here is an example response:
    
    [{"name": "Tuna with rice", "ingredients": ["Tuna", "Rice"]},{"name": "Broccoli with garlic", "ingredients": ["garlic", "broccoli"]}]
    
    Under no circumstances return any preamble or explanations. Start your output with [ and end with ].
    Don't output any newlines`;
    logger.log("PROMPT_TEMPLATE", PROMPT_TEMPLATE);
    var response = await model.prompt(PROMPT_TEMPLATE);
    logger.log("AI Response:", response);
    response = response.trim();

    return parseLLMResponse(response);
}

async function extractTranscriptText() {
    try {
        const model = await initializeAI();
        if (model) {

            // may try description first, in cas the author wrote a description for the video including ingredient lists
            // const descriptionText = getDescriptionText();
            // recipes = await extractIngredientListFromDescription(model, descriptionText);

            const transcriptText = getTranscriptText();
            recipes = await extractIngredientListFromTranscript(model, transcriptText);

            if (!recipes) {
                logger.error("No description or transcript found.");
                chrome.runtime.sendMessage({ type: 'error', error: 'Could not find description or transcript' });
                return;
            }

            logger.log("Recipe data sent to background script:", recipes);
            chrome.runtime.sendMessage({
                type: 'ingredientsForSidePanel',
                recipes: recipes
            }).catch(error => {
                logger.log('Error sending message:', error);
            });
        }
    } catch (error) {
        logger.error("Error processing with AI:", error);
        chrome.runtime.sendMessage({ type: 'error', error: 'AI Error' });
    }
}

function openTranscript() {
    const timeout_after_button_click = 1000;
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
                }, timeout_after_button_click);
            } else {
                logger.log("Transcript button not found or unavailable for this video.");
            }
        }, timeout_after_button_click);
    } else {
        logger.log("More actions button not found.");
    }
}
