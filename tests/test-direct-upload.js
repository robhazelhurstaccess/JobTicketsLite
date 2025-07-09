// Simple test to check if there's a middleware conflict
// Run this script to test the route directly

const http = require('http');
const FormData = require('form-data');
const fs = require('fs');

async function testImageUpload() {
    console.log('🧪 Testing image upload directly...');
    
    try {
        // Create a simple test image buffer
        const testImageBuffer = Buffer.from('fake-image-data');
        
        // Create form data
        const form = new FormData();
        form.append('content', ''); // Empty content
        form.append('screenshot', testImageBuffer, {
            filename: 'test.png',
            contentType: 'image/png'
        });
        
        // Make request
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/tickets/1/notes', // Assuming ticket ID 1 exists
            method: 'POST',
            headers: form.getHeaders()
        };
        
        const req = http.request(options, (res) => {
            console.log(`Status: ${res.statusCode}`);
            console.log(`Headers: ${JSON.stringify(res.headers)}`);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('Response:', data);
                if (res.statusCode === 400) {
                    console.log('❌ Still getting validation error');
                } else {
                    console.log('✅ Success!');
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('Request error:', error);
        });
        
        form.pipe(req);
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

console.log('To run this test:');
console.log('1. Start the server: npm run dev');
console.log('2. Make sure you have at least one ticket in the database');
console.log('3. Run: node test-direct-upload.js');
console.log('\\nThis will test if the issue is in the middleware stack.');
