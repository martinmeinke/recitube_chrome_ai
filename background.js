console.log('Background script loaded');

let lastIngredients = null;

chrome.action.onClicked.addListener(async (tab) => {
    console.log('Extension icon clicked');
    if (tab.url.includes("youtube.com/watch")) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
        chrome.tabs.sendMessage(tab.id, {action: "extractTranscript"});
    }
});


