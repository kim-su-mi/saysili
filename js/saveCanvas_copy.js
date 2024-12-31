// document.getElementById('saveButton').addEventListener('click', async function() {
//     // Array of views to save
//     const views = ['outer-front', 'outer-back', 'inner-front', 'inner-back'];
//     const savedFiles = [];

//     // Store current view to restore later
//     const originalView = currentView;
    
//     // Save each view
//     for (const view of views) {
//         try {
//             // Switch to the view we want to save
//             await switchToView(view);
            
//             // Get the SVG data for current view
//             const svgData = await generateSVG();
            
//             // Create file name based on view
//             const fileName = `bracelet-${view}.svg`;
            
//             // Create Blob and trigger download
//             const blob = new Blob([svgData], { type: 'image/svg+xml' });
//             const url = URL.createObjectURL(blob);
            
//             // Create download link
//             const link = document.createElement('a');
//             link.href = url;
//             link.download = fileName;
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
            
//             // Clean up
//             URL.revokeObjectURL(url);
            
//             savedFiles.push(fileName);
            
//         } catch (error) {
//             console.error(`Error saving ${view}:`, error);
//         }
//     }
    
//     // Restore original view
//     await switchToView(originalView);
    
//     // Show success message
//     alert(`Successfully saved: \n${savedFiles.join('\n')}`);
// });

// // Function to switch views
// async function switchToView(view) {
//     return new Promise((resolve) => {
//         // Save current canvas state
//         saveCurrentCanvasState();
        
//         // Update current view
//         currentView = view;
        
//         // Load SVG for the view
//         const svgPath = view.startsWith('inner') ? 'images/braceletInner.svg' : 'images/bracelet.svg';
        
//         changeSVGImage(svgPath).then(() => {
//             // Load the canvas state for this view
//             loadCanvasState();
//             fabricCanvas.renderAll();
//             resolve();
//         });
//     });
// }

// // Function to generate SVG data
// async function generateSVG() {
//     return new Promise((resolve) => {
//         // Get the canvas SVG
//         const svgData = fabricCanvas.toSVG({
//             width: fabricCanvas.width,
//             height: fabricCanvas.height,
//             viewBox: {
//                 x: 0,
//                 y: 0,
//                 width: fabricCanvas.width,
//                 height: fabricCanvas.height
//             },
//             suppressPreamble: false
//         });
        
//         resolve(svgData);
//     });
// }

// // Helper function to check if canvas has objects
// function hasObjects() {
//     return fabricCanvas.getObjects().length > 0;
// }

// Save button event listener
document.getElementById('saveButton').addEventListener('click', async function() {
    try {
        // Store original state
        const originalView = currentView;
        const activeColorButton = document.querySelector('.color_selection_btn.active');
        const currentColor = activeColorButton ? 
            window.getComputedStyle(activeColorButton).backgroundColor :
            '#00b7e9';

        // Create SVG header
        let combinedSVG = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
    </defs>`;

        // Process each view
        const views = ['outer-front', 'outer-back', 'inner-front', 'inner-back'];
        for (let i = 0; i < views.length; i++) {
            const view = views[i];
            
            // Switch to view and wait for complete load
            await switchToViewAndWait(view);
            
            // Get canvas content including background and objects
            const viewContent = await captureViewContent(view, i);
            combinedSVG += viewContent;
        }

        // Close SVG
        combinedSVG += '\n</svg>';

        // Download the file
        const blob = new Blob([combinedSVG], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'bracelet-all-views.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Restore original view
        await switchToViewAndWait(originalView);

    } catch (error) {
        console.error('Error saving SVG:', error);
        alert('Error saving SVG file. Please try again.');
    }
});

// Function to switch view and ensure complete load
async function switchToViewAndWait(view) {
    return new Promise((resolve) => {
        // Save current canvas state
        saveCurrentCanvasState();
        
        // Update current view
        currentView = view;
        
        // Load SVG for the view
        const svgPath = view.startsWith('inner') ? 'images/braceletInner.svg' : 'images/bracelet.svg';
        
        changeSVGImage(svgPath).then(() => {
            // Load the canvas state for this view
            loadCanvasState();
            
            // Give extra time for rendering
            setTimeout(() => {
                fabricCanvas.renderAll();
                resolve();
            }, 100);
        });
    });
}

// Function to capture view content
async function captureViewContent(viewName, index) {
    return new Promise((resolve) => {
        const yOffset = index * (fabricCanvas.height + 20);

        // Wait for next frame to ensure canvas is fully rendered
        requestAnimationFrame(() => {
            // Get complete canvas SVG including background and objects
            let viewSVG = fabricCanvas.toSVG({
                viewBox: {
                    x: 0,
                    y: 0,
                    width: fabricCanvas.width,
                    height: fabricCanvas.height
                },
                width: fabricCanvas.width,
                height: fabricCanvas.height,
                suppressPreamble: true
            });

            // Remove outer svg tags and clean up SVG content
            viewSVG = viewSVG
                .replace(/<svg[^>]*>/g, '')
                .replace(/<\/svg>/g, '')
                .replace(/<\?xml[^>]*\?>/g, '')
                .replace(/<!DOCTYPE[^>]*>/g, '');

            // Make gradient IDs unique using current view and index
            viewSVG = viewSVG.replace(/SVGID_\d+/g, (match) => 
                `SVGID_${viewName.replace(/[^a-zA-Z0-9]/g, '')}_${index}_${Math.random().toString(36).substr(2, 9)}`
            );

            // Create group for this view
            const groupSVG = `
    <g transform="translate(0, ${yOffset})" data-view="${viewName}">
        <title>${formatViewName(viewName)}</title>
        ${viewSVG}
    </g>`;

            resolve(groupSVG);
        });
    });
}

// Helper function to format view names
function formatViewName(view) {
    const viewNames = {
        'outer-front': '외부 앞면',
        'outer-back': '외부 뒷면',
        'inner-front': '내부 앞면',
        'inner-back': '내부 뒷면'
    };
    return viewNames[view] || view;
}
