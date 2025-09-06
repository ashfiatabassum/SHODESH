// This script injects our fixed update route implementation
const fs = require('fs');
const path = require('path');

const staffJsPath = path.join(__dirname, 'src', 'routes', 'staff.js');
const updateCodePath = path.join(__dirname, 'src', 'routes', 'update_endpoint.js');

try {
    // Read both files
    let staffJs = fs.readFileSync(staffJsPath, 'utf8');
    const updateCode = fs.readFileSync(updateCodePath, 'utf8');
    
    // Find the start of the update route
    const routeStartPattern = /router\.put\('\/update\/:staffId',\s*async\s*\(req,\s*res\)\s*=>\s*\{/;
    const routeStartMatch = staffJs.match(routeStartPattern);
    
    if (!routeStartMatch) {
        throw new Error('Could not find the update route in staff.js');
    }
    
    const startIndex = routeStartMatch.index;
    
    // Find the end of the update route
    let braceCount = 1;
    let endIndex = startIndex + routeStartMatch[0].length;
    
    while (braceCount > 0 && endIndex < staffJs.length) {
        if (staffJs[endIndex] === '{') braceCount++;
        if (staffJs[endIndex] === '}') braceCount--;
        endIndex++;
    }
    
    // Extract the route content for verification
    const routeContent = staffJs.substring(startIndex, endIndex);
    console.log(`Found update route from position ${startIndex} to ${endIndex}`);
    console.log(`Route length: ${routeContent.length} characters`);
    
    // Replace the old route with our new implementation
    const newStaffJs = 
        staffJs.substring(0, startIndex) + 
        updateCode + 
        staffJs.substring(endIndex);
    
    // Write the modified file
    fs.writeFileSync(staffJsPath, newStaffJs, 'utf8');
    console.log('Successfully updated the staff.js file');
    
} catch (error) {
    console.error('Error updating staff.js file:', error);
}
