// Establish connection with background script
console.log("sidepanel connected to background");

function showErrorStatus(message) {
    const statusElement = document.getElementById('status-message');
    statusElement.innerHTML = '';
    statusElement.classList.add('error');
    
    const messageText = document.createElement('span');
    messageText.textContent = message;
    statusElement.appendChild(messageText);
    
    statusElement.style.display = 'block';
}

// Add status handling functions
function showStatus(message) {
    const statusElement = document.getElementById('status-message');
    statusElement.innerHTML = '';
    statusElement.classList.remove('error');  // Remove error class if it exists
    
    // Create and add spinner
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    statusElement.appendChild(spinner);
    
    // Add message
    const messageText = document.createElement('span');
    messageText.textContent = message;
    statusElement.appendChild(messageText);
    
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
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        // Create Amazon button
        const amazonLink = document.createElement('a');
        amazonLink.href = `https://www.amazon.com/s?k=${encodeURIComponent(ingredient)}`;
        amazonLink.className = 'buy-link amazon';
        amazonLink.textContent = 'Amazon';
        amazonLink.target = '_blank';

        // Create Walmart button
        const walmartLink = document.createElement('a');
        walmartLink.href = `https://www.walmart.com/search?q=${encodeURIComponent(ingredient)}`;
        walmartLink.className = 'buy-link walmart';
        walmartLink.textContent = 'Walmart';
        walmartLink.target = '_blank';

        buttonContainer.appendChild(amazonLink);
        buttonContainer.appendChild(walmartLink);
        linkCell.appendChild(buttonContainer);
        
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
    const ingredientsList = document.getElementById('ingredients-list');
   
    switch(message.type) {
        case 'processingStarted':
            showStatus('Extracting ingredients...');
            ingredientsList.innerHTML = '';

            break;
            
        case 'ingredientsForSidePanel':
            hideStatus();
            ingredientsList.innerHTML = '';
            
            message.recipes.forEach(recipe => {
                const recipeCard = createRecipeCard(recipe);
                ingredientsList.appendChild(recipeCard);
            });
            break;
            
        case 'error':
            showErrorStatus('Error: ' + message.error);
            break;
    }
});

// Show initial status
showStatus('Waiting for video...');
