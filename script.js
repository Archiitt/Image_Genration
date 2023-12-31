// Select the element with the class "generate-form"
const generateForm = document.querySelector(".generate-form");

// Select the button within the "generate-form" with the class "generate-btn"
const generateBtn = generateForm.querySelector(".generate-btn");

// Select the element with the class "image-gallery"
const imageGallery = document.querySelector(".image-gallery");

// Set your OpenAI API key (replace "sk-" with your actual API key)
const OPENAI_API_KEY = "sk-"; 

// Variable to track whether image generation is in progress
let isImageGenerating = false;

// Function to update image cards in the image gallery based on provided image data array
const updateImageCard = (imgDataArray) => {
  // Iterate through each image data object in the array
  imgDataArray.forEach((imgObject, index) => {
    // Select the image card for the current image based on index
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    
    // Select the image element within the image card
    const imgElement = imgCard.querySelector("img");
    
    // Select the download button within the image card
    const downloadBtn = imgCard.querySelector(".download-btn");

                           // Set the image source to the AI-generated image data
    const aiGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgElement.src = aiGeneratedImage;

    // When the image is loaded, remove the loading class and set download attributes
    imgElement.onload = () => {
      // Remove the "loading" class to indicate image has finished loading
      imgCard.classList.remove("loading");

      // Set the download link to the AI-generated image and specify download filename
      downloadBtn.setAttribute("href", aiGeneratedImage);
      downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
    }
  });
}
// Async function to generate AI images based on user input
const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    // Send a request to the OpenAI API to generate images based on user inputs
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      // Prepare the request body with user-provided prompt and image quantity
      body: JSON.stringify({
        prompt: userPrompt,
        n: userImgQuantity,
        size: "512x512", // Image size specification
        response_format: "b64_json" // Response format for image data
      }),
    });
    // Throw an error message if the API response is unsuccessful
    if (!response.ok) throw new Error("Failed to generate AI images. Make sure your API key is valid.");

    // Parse the response data to extract image information
    const { data } = await response.json(); // Get data from the response

    // Update the image cards with the generated image data
    updateImageCard([...data]);
  } catch (error) {
    // If an error occurs during the API request, display an alert with the error message
    alert(error.message);
  } finally {
    // Regardless of success or failure, re-enable the generate button and update its text
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";

    // Set the image generation flag to false to allow subsequent generation requests
    isImageGenerating = false;
  }
}
// Function to handle the image generation process
const handleImageGeneration = (e) => {
  e.preventDefault();

  // Check if image generation is already in progress, if so, return
  if (isImageGenerating) return;

  // Get user input for the prompt and the desired number of images to generate
  const userPrompt = e.srcElement[0].value;
  const userImgQuantity = parseInt(e.srcElement[1].value);

  // Disable the generate button, update its text, and set the generation flag
  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Generating";
  isImageGenerating = true;
}

  // Creating HTML markup for image cards with loading state
  const imgCardMarkup = Array.from({ length: userImgQuantity }, () => 
      `<div class="img-card loading">
        <img src="images/loader.svg" alt="AI generated image">
        <a class="download-btn" href="#">
          <img src="images/download.svg" alt="download icon">
        </a>
      </div>`
  ).join("");

  // Set the image gallery's inner HTML to the generated image card markup
  imageGallery.innerHTML = imgCardMarkup;

  // Call the function to generate AI images based on user input
  generateAiImages(userPrompt, userImgQuantity);
}

// Attach an event listener to the form's submit event to handle image generation
generateForm.addEventListener("submit", handleImageGeneration);
