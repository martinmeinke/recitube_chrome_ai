<p align="center">
  <img src="img/chefs_hat_128.png" alt="Recitube Logo" width="128" height="128">
</p>

# Recitube chrome extension
RecipeTube is a chrome extension that extracts ingredients from YouTube videos.

## Details
I often watch cooking videos on youtube. Even though I like the videos and plan on cooking the recipes at home, I often end up being too lazy to buy all of the ingredients.

This is my attempt at solving this dilemma.

Recitube fetches video transcripts from youtube. It then instruments the Chrome AI API to perform ingredient extraction in a "vanilla-RAG" fashion. It provides convenient search links to Amazon (Whole Foods) enable friction-free shopping.

See it in action [here](https://youtu.be/aShynj946qc).

## Known Issues

_The extension may not work on all YouTube videos._

### Context Length of the LLM?
Some youtubers are very talkative and the transcript can be very long. I am not sure what the limits of the currently used on-device models are.
I am experimenting with iteratively shortening the transcript to fit the context length of the LLM for a final extraction. 

### Ingredients are not always mentioned / not always in the transcript
This is another issue that is not easily solvable with the current approach.
Maybe easier solutions could be to either scan the video description / comment section for a list of ingredients, or get extra fancy and try to extract the ingredients via image-to-text models. The sky is the limit of course.

## Installation
0. Ensure that chrome is setup for use of on-device AI models. [Instructions here](https://github.com/lightning-joyce/chromeai?tab=readme-ov-file#how-to-set-up-built-in-gemini-nano-in-chrome)
1. Clone the repo 
2. In chrome, go to Settings > Extensions, and enable "Developer mode". Then click on "Load unpacked" and select the root folder of the cloned repo.
3. In chrome, go to youtube.com, pull up the video of a recipe you want to cook, and click on the Recitube icon (chef hat) in the toolbar.

__HINT: This uses features which are still experimental in Chrome. I have tested this extension on Chrome 131 and Canary 133.__

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details