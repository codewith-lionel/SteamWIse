require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
  console.log('Testing Gemini API Key with free tier...');
  console.log('API Key (first 20 chars):', process.env.GEMINI_API_KEY?.substring(0, 20));
  console.log('');
  
  const modelsToTest = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'models/gemini-pro',
    'models/gemini-1.5-pro', 
    'models/gemini-1.5-flash'
  ];
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello in one word');
      const text = result.response.text();
      console.log(`✓ SUCCESS with ${modelName}: ${text}`);
      console.log('This model works! Use this one.\n');
      break;
    } catch (error) {
      console.log(`✗ FAILED with ${modelName}: ${error.message}\n`);
    }
  }
}

testModels();
