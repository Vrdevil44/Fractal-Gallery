// Main application script for Mathematical Art Gallery
document.addEventListener('DOMContentLoaded', function() {
    // Initialize loading screen
    const loadingScreen = document.getElementById('loading-screen');
    const loadingBar = document.getElementById('loading-bar');
    
    // Simulate loading progress
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            // Hide loading screen after a short delay
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 1000);
            }, 500);
        }
        
        loadingBar.style.width = `${progress}%`;
    }, 100);
    
    // Create pattern cards
    const patternGrid = document.getElementById('pattern-grid');
    
    patterns.forEach(pattern => {
        const card = document.createElement('div');
        card.className = 'pattern-card';
        card.dataset.id = pattern.id;
        card.dataset.color = pattern.color;
        
        card.innerHTML = `
            <div class="pattern-preview" id="preview-${pattern.id}"></div>
            <div class="pattern-info">
                <h3 class="pattern-name">${pattern.name}</h3>
                <p class="pattern-description">${pattern.description}</p>
            </div>
        `;
        
        patternGrid.appendChild(card);
        
        // Initialize preview visualization after a short delay
        setTimeout(() => {
            initVisualization(`preview-${pattern.id}`, pattern.id);
        }, 200);
        
        // Add click event to open modal
        card.addEventListener('click', () => openModal(pattern));
    });
    
    // Modal functionality
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const visualizationContainer = document.getElementById('visualization-container');
    const aboutText = document.getElementById('about-text');
    const mathText = document.getElementById('math-text');
    const natureText = document.getElementById('nature-text');
    const factText = document.getElementById('fact-text');
    const closeModalBtn = document.getElementById('close-modal');
    
    // Parameter controls
    const param1Slider = document.getElementById('param1');
    const param2Slider = document.getElementById('param2');
    const param1Label = document.getElementById('param1-label');
    const param2Label = document.getElementById('param2-label');
    const param1Value = document.getElementById('param1-value');
    const param2Value = document.getElementById('param2-value');
    const resetBtn = document.getElementById('reset-btn');
    const randomizeBtn = document.getElementById('randomize-btn');
    
    // Current active pattern
    let activePattern = null;
    
    // Open modal function
    function openModal(pattern) {
        // Set modal content
        modalTitle.textContent = pattern.name;
        aboutText.textContent = pattern.about;
        mathText.textContent = pattern.mathSignificance;
        natureText.textContent = pattern.naturalOccurrences;
        factText.textContent = pattern.interestingFact;
        
        // Set parameter labels
        param1Label.textContent = pattern.paramLabel1 || 'Parameter 1';
        param2Label.textContent = pattern.paramLabel2 || 'Parameter 2';
        
        // Reset parameter values
        param1Slider.value = 50;
        param2Slider.value = 50;
        param1Value.textContent = param1Slider.value;
        param2Value.textContent = param2Slider.value;
        
        // Clear previous visualization
        visualizationContainer.innerHTML = '';
        
        // Store active pattern
        activePattern = pattern;
        
        // Apply theme color based on pattern
        document.documentElement.style.setProperty('--primary-color', pattern.color);
        document.documentElement.style.setProperty('--secondary-color', shiftColor(pattern.color, 0.33));
        document.documentElement.style.setProperty('--accent-color', shiftColor(pattern.color, 0.66));
        
        // Show modal with animation
        modalOverlay.style.display = 'flex';
        setTimeout(() => {
            modalOverlay.classList.add('active');
        }, 10);
        
        // Initialize visualization
        setTimeout(() => {
            initVisualization('visualization-container', pattern.id);
        }, 300);
    }
    
    // Close modal function
    function closeModal() {
        modalOverlay.classList.remove('active');
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            
            // Clean up visualization
            if (activeVisualizations['visualization-container']) {
                const viz = activeVisualizations['visualization-container'];
                if (viz.cleanup) viz.cleanup();
                
                if (viz.renderer && viz.renderer.domElement) {
                    viz.renderer.domElement.remove();
                }
                
                if (viz.animationId) {
                    cancelAnimationFrame(viz.animationId);
                }
                
                delete activeVisualizations['visualization-container'];
            }
            
            activePattern = null;
        }, 300);
    }
    
    // Close modal when clicking close button
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside content
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Connect parameter sliders
    param1Slider.addEventListener('input', () => {
        param1Value.textContent = param1Slider.value;
        
        if (activePattern) {
            updateVisualization(
                activePattern.id,
                param1Slider.value / 100,
                param2Slider.value / 100
            );
        }
    });
    
    param2Slider.addEventListener('input', () => {
        param2Value.textContent = param2Slider.value;
        
        if (activePattern) {
            updateVisualization(
                activePattern.id,
                param1Slider.value / 100,
                param2Slider.value / 100
            );
        }
    });
    
    // Reset button
    resetBtn.addEventListener('click', () => {
        param1Slider.value = 50;
        param2Slider.value = 50;
        param1Value.textContent = param1Slider.value;
        param2Value.textContent = param2Slider.value;
        
        if (activePattern) {
            updateVisualization(
                activePattern.id,
                0.5,
                0.5
            );
        }
    });
    
    // Randomize button
    randomizeBtn.addEventListener('click', () => {
        const random1 = Math.floor(Math.random() * 100);
        const random2 = Math.floor(Math.random() * 100);
        
        param1Slider.value = random1;
        param2Slider.value = random2;
        param1Value.textContent = random1;
        param2Value.textContent = random2;
        
        if (activePattern) {
            updateVisualization(
                activePattern.id,
                random1 / 100,
                random2 / 100
            );
        }
    });
    
    // Helper function to shift color hue
    function shiftColor(hexColor, hueShift) {
        const color = new THREE.Color(hexColor);
        const hsl = {};
        color.getHSL(hsl);
        
        const newHue = (hsl.h + hueShift) % 1;
        return new THREE.Color().setHSL(newHue, hsl.s, hsl.l).getHexString();
    }
});
