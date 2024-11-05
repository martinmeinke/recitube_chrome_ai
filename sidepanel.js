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
                const recipeDiv = document.createElement('div');
                recipeDiv.className = 'recipe';
                
                const title = document.createElement('h3');
                title.textContent = recipe.name;
                recipeDiv.appendChild(title);
                
                const ingredientsForRecipe = document.createElement('ul');
                recipe.ingredients.forEach(ingredient => {
                    const li = document.createElement('li');
                    li.textContent = ingredient;
                    ingredientsForRecipe.appendChild(li);
                });
                
                recipeDiv.appendChild(ingredientsForRecipe);
                ingredientsList.appendChild(recipeDiv);
            });
            break;
            
        case 'error':
            showStatus('Error: ' + message.error);
            break;
    }
});

// Show initial status
showStatus('Waiting for video...');
