// Establish connection with background script
const port = chrome.runtime.connect({name: 'sidepanel'});

// Listen for messages from background script
port.onMessage.addListener((message) => {
    if (message.type === 'ingredients') {
        console.log("displaying ingredients", message.ingredients);
        displayIngredients(message.ingredients);
    }
});

function displayIngredients(ingredients) {
    const container = document.getElementById('ingredients-list');
    container.innerHTML = ''; // Clear existing content
    
    ingredients.forEach(ingredient => {
        const div = document.createElement('div');
        div.className = 'ingredient-item';
        
        const span = document.createElement('span');
        span.className = 'ingredient-name';
        span.textContent = ingredient;
        
        const link = document.createElement('a');
        link.className = 'search-link';
        link.href = `https://www.google.com/search?q=${encodeURIComponent(ingredient)}`;
        link.target = '_blank';
        link.textContent = 'Search';
        
        div.appendChild(span);
        div.appendChild(link);
        container.appendChild(div);
    });
} 