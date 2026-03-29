const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  if (!API_KEY) {
    console.error('Error: GEMINI_API_KEY is not set in .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  try {
    const models = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).listModels();
    // Note: getGenerativeModel is usually used for generating content. 
    // To list models, we typically use the REST API or the v1beta1 client if available in this SDK version.
    // In @google/generative-ai, listing models is actually slightly different.
    
    console.log('Listing models...');
    // The standard SDK doesn't always expose listModels directly on the main class in older versions, 
    // but let's try the common pattern or use fetch if it fails.
  } catch (err) {
    // If SDK method fails, use raw fetch to be 100% sure
    console.log('SDK listModels failed or unavailable. Trying raw fetch...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  }
}

listModels();
