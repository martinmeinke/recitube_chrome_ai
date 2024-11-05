// Establish connection with background script
console.log("sidepanel connected to background");

// Add status handling functions
function showStatus(message) {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.style.display = 'block';
}

function hideStatus() {
    const statusElement = document.getElementById('status-message');
    statusElement.style.display = 'none';
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';

    const title = document.createElement('h3');
    title.className = 'recipe-title';
    title.textContent = recipe.name;
    card.appendChild(title);

    const table = document.createElement('table');
    table.className = 'ingredients-table';

    recipe.ingredients.forEach(ingredient => {
        const row = document.createElement('tr');
        
        const ingredientCell = document.createElement('td');
        ingredientCell.textContent = ingredient;
        
        const linkCell = document.createElement('td');
        const buyLink = document.createElement('a');
        buyLink.href = `https://www.amazon.com/s?k=${encodeURIComponent(ingredient)}`;
        buyLink.className = 'buy-link';
        buyLink.textContent = 'Buy';
        buyLink.target = '_blank';
        linkCell.appendChild(buyLink);
        
        row.appendChild(ingredientCell);
        row.appendChild(linkCell);
        table.appendChild(row);
    });

    card.appendChild(table);
    return card;
}

// Modify your message listener to handle status updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("sidepanel received message:", message);
    
    switch(message.type) {
        case 'processingStarted':
            showStatus('Processing video transcript...');
            break;
            
        case 'ingredientsForSidePanel':
            hideStatus();
            const ingredientsList = document.getElementById('ingredients-list');
            ingredientsList.innerHTML = '';
            
            message.recipes.forEach(recipe => {
                const recipeCard = createRecipeCard(recipe);
                ingredientsList.appendChild(recipeCard);
            });
            break;
            
        case 'error':
            showStatus('Error: ' + message.error);
            break;
    }
});

// Show initial status
showStatus('Waiting for video...');
