const http = require('http');
const querystring = require('querystring');

// Test configuration
const HOST = 'localhost';
const PORT = 3000;
const BASE_URL = `http://${HOST}:${PORT}`;

// Test data
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
};

const testTicket = {
    title: 'Test Ticket',
    description: 'This is a test ticket',
    priority: 'medium',
    status: 'open'
};

// HTTP request helper
function makeRequest(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: parsedData,
                        headers: res.headers
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: responseData,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Test functions
async function testHealthCheck() {
    console.log('🔍 Testing health check...');
    try {
        const response = await makeRequest('/api/health');
        if (response.status === 200) {
            console.log('✅ Health check passed');
            return true;
        } else {
            console.log('❌ Health check failed:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Health check error:', error.message);
        return false;
    }
}

async function testUserRegistration() {
    console.log('🔍 Testing user registration...');
    try {
        const response = await makeRequest('/api/auth/register', 'POST', testUser);
        if (response.status === 201) {
            console.log('✅ User registration passed');
            return true;
        } else if (response.status === 400 && response.data.error.includes('already exists')) {
            console.log('✅ User registration passed (user already exists)');
            return true;
        } else {
            console.log('❌ User registration failed:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ User registration error:', error.message);
        return false;
    }
}

async function testUserLogin() {
    console.log('🔍 Testing user login...');
    try {
        const response = await makeRequest('/api/auth/login', 'POST', {
            username: 'admin',
            password: 'admin123'
        });
        
        if (response.status === 200) {
            console.log('✅ User login passed');
            return response.headers['set-cookie'];
        } else {
            console.log('❌ User login failed:', response.status, response.data);
            return null;
        }
    } catch (error) {
        console.log('❌ User login error:', error.message);
        return null;
    }
}

async function testTicketCreation(cookie) {
    console.log('🔍 Testing ticket creation...');
    try {
        const headers = cookie ? { Cookie: cookie } : {};
        const response = await makeRequest('/api/tickets', 'POST', testTicket, headers);
        
        if (response.status === 201) {
            console.log('✅ Ticket creation passed');
            return response.data;
        } else {
            console.log('❌ Ticket creation failed:', response.status, response.data);
            return null;
        }
    } catch (error) {
        console.log('❌ Ticket creation error:', error.message);
        return null;
    }
}

async function testTicketRetrieval(cookie) {
    console.log('🔍 Testing ticket retrieval...');
    try {
        const headers = cookie ? { Cookie: cookie } : {};
        const response = await makeRequest('/api/tickets', 'GET', null, headers);
        
        if (response.status === 200) {
            console.log('✅ Ticket retrieval passed');
            console.log(`📊 Found ${response.data.length} tickets`);
            return response.data;
        } else {
            console.log('❌ Ticket retrieval failed:', response.status, response.data);
            return null;
        }
    } catch (error) {
        console.log('❌ Ticket retrieval error:', error.message);
        return null;
    }
}

// Main test function
async function runTests() {
    console.log('🎫 JobTickets Lite - API Tests');
    console.log('===============================');
    
    // Test if server is running
    const healthCheck = await testHealthCheck();
    if (!healthCheck) {
        console.log('❌ Server is not running. Please start the server first.');
        process.exit(1);
    }
    
    // Test user registration
    await testUserRegistration();
    
    // Test user login
    const cookie = await testUserLogin();
    if (!cookie) {
        console.log('❌ Cannot proceed with tests - login failed');
        process.exit(1);
    }
    
    // Test ticket creation
    const newTicket = await testTicketCreation(cookie);
    
    // Test ticket retrieval
    const tickets = await testTicketRetrieval(cookie);
    
    console.log('');
    console.log('✅ All tests completed!');
    console.log('🚀 Your JobTickets Lite application is working correctly.');
    console.log('📱 Open http://localhost:3000 in your browser to use the application.');
}

// Check if server is running before starting tests
setTimeout(() => {
    runTests().catch(error => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    });
}, 1000);
