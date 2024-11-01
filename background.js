console.log('Background script loaded');

let lastIngredients = null;

chrome.action.onClicked.addListener(async (tab) => {
    console.log('Extension icon clicked');
    if (tab.url.includes("youtube.com/watch")) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
        chrome.tabs.sendMessage(tab.id, {action: "extractTranscript"});
    }
});

// Listen for ingredients from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);
    if (message.type === 'ingredientsForSidePanel') {
        lastIngredients = message.ingredients;
        console.log('Stored ingredients:', lastIngredients);
    }
});

// Listen for side panel connection
chrome.runtime.onConnect.addListener((port) => {
    console.log('New connection from:', port.name);
    if (port.name === 'sidepanel') {
        console.log('Sidepanel connected, sending ingredients:', lastIngredients);
        if (lastIngredients) {
            port.postMessage({
                type: 'ingredients',
                ingredients: lastIngredients
            });
        }
        
        // Listen for port disconnect
        port.onDisconnect.addListener(() => {
            console.log('Sidepanel disconnected');
        });
    }
}); 