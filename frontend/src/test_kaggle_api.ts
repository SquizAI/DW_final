import { kaggleApi } from './api';

// Test the Kaggle API
async function testKaggleApi() {
  try {
    console.log('Testing Kaggle API search...');
    const response = await kaggleApi.search('titanic');
    console.log('Response:', response);
    
    if (response.data && Array.isArray(response.data)) {
      console.log(`Found ${response.data.length} datasets`);
      
      if (response.data.length > 0) {
        console.log('First dataset:', response.data[0]);
      }
    } else {
      console.log('No datasets found or unexpected response format');
    }
  } catch (error) {
    console.error('Error testing Kaggle API:', error);
  }
}

// Run the test
testKaggleApi(); 