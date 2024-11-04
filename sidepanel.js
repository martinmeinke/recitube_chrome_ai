
// Establish connection with background script
console.log("sidepanel connected to background");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    alert("sidepanel received message: " + message.type);
    console.log("sidepanel received message:", message.type);
    if (message.type === 'ingredientsForSidePanel') {
        alert("sidepanel received message2" + message);
        // Change this line to match your HTML element ID
        const ingredientsList = document.getElementById('ingredients-list');
        ingredientsList.innerHTML = ''; // Clear existing content
        console.log("message:", message);
        
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
    }
});
