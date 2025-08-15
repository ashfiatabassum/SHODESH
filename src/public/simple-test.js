// Simple API test script to debug foundation loading
console.log('🔧 Simple Foundation API Test Loading...');

// Test function that exactly mimics what the admin panel does
async function simpleFoundationTest() {
    console.log('🚀 Starting simple foundation test...');
    
    try {
        console.log('📡 Making API call...');
        
        const response = await fetch('/api/admin/foundations?status=unverified', {
            headers: {
                'Authorization': 'test-admin-token',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📨 Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        const data = await response.json();
        console.log('📊 Data received:', data);
        
        if (data.success) {
            console.log('✅ SUCCESS! Foundation count:', data.data.length);
            data.data.forEach((foundation, index) => {
                console.log(`🏢 Foundation ${index + 1}:`, {
                    id: foundation.foundation_id,
                    name: foundation.foundation_name,
                    status: foundation.status
                });
            });
            
            // Display on page
            document.body.innerHTML += `
                <h2>✅ Foundation API Test Successful!</h2>
                <p><strong>Found ${data.data.length} foundations:</strong></p>
                <ul>
                    ${data.data.map(f => `<li>${f.foundation_name} (${f.foundation_id}) - Status: ${f.status}</li>`).join('')}
                </ul>
            `;
        } else {
            console.error('❌ API returned error:', data.message);
            document.body.innerHTML += `<h2>❌ API Error: ${data.message}</h2>`;
        }
        
    } catch (error) {
        console.error('💥 Fetch error:', error);
        document.body.innerHTML += `<h2>💥 Network Error: ${error.message}</h2>`;
    }
}

// Run test when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', simpleFoundationTest);
} else {
    simpleFoundationTest();
}
