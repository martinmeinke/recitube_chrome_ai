console.log('Background script loaded');

let lastIngredients = null;

chrome.action.onClicked.addListener(async (tab) => {
    console.log('Extension icon clicked');
    if (tab.url.includes("youtube.com/watch")) {
        const maxRetries = 1;
        const retryDelay = 500;
        let retryCount = 0;
        const tryOperation = async () => {
            try {
                await chrome.sidePanel.open({ windowId: tab.windowId });
                await chrome.tabs.sendMessage(tab.id, {action: "extractTranscript"});
            } catch (error) {
                console.error('Error:', error);
                if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(tryOperation, retryDelay);
                } else {
                    console.error('Max retries reached. Could not open side panel.');
                }
            }
        };

        await tryOperation();
    }
});

