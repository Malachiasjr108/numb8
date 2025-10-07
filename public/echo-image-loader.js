
// Script to load Echo images from the admin panel into the pages

(function() {
  // Get current page and extract echo number from URL
  const urlParams = new URLSearchParams(window.location.search);
  const echoNumber = urlParams.get('echo');

  if (!echoNumber) {
    console.log('No echo number in URL');
    return;
  }

  // Fetch the image for this echo
  fetch(`/api/echoes/${echoNumber}`)
    .then(response => response.json())
    .then(data => {
      if (data.hasImage && data.imageUrl) {
        // Find the container to inject the image
        const loreSection = document.querySelector('.lore');
        if (loreSection) {
          const imageContainer = document.createElement('div');
          imageContainer.className = 'echo-image-container';
          imageContainer.style.cssText = `
            margin: 30px auto;
            max-width: 600px;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 0 30px rgba(0, 204, 255, 0.5);
            border: 2px solid #00ccff;
          `;

          const img = document.createElement('img');
          img.src = data.imageUrl;
          img.alt = `Echo ${echoNumber}`;
          img.style.cssText = `
            width: 100%;
            height: auto;
            display: block;
          `;

          imageContainer.appendChild(img);
          
          // Insert after the lore section
          loreSection.parentNode.insertBefore(imageContainer, loreSection.nextSibling);
        }
      }
    })
    .catch(error => {
      console.error('Error loading echo image:', error);
    });
})();
