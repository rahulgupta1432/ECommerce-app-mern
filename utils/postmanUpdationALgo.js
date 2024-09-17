// import axios from 'axios';
import fetch from 'node-fetch';
import fs from 'fs/promises';

// const filePath = 'C:\\Users\\Rahul Gupta\\Documents\\Personal-Projects\\ECommerce-App\\postman-collection.json';
const filePath="./postman-collection.json";

const updatePostmanCollection = async () => {
  try {
    // Load your updated collection JSON
    const updatedCollection = JSON.parse(await fs.readFile(filePath, 'utf8'));

    // Postman API key and collection ID
    const apiKey = process.env.POSTMAN_API_KEY;
    const collectionId = process.env.POSTMAN_COLLECTION_ID;

    // Postman API URL to update collection
    const url = `https://api.getpostman.com/collections/${collectionId}`;

    // Perform the PATCH request to update the collection
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedCollection) // Send the collection directly without 'collection' wrapper
    });

    // Check if the response status is not OK (200-299)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response}, message: ${errorData.error.message}`);
    }

    const data = await response.json();
    if(!data){
      throw new Error('No data received from API');
    }
    
    console.log('Collection updated successfully', data);
  } catch (error) {
    console.error('Error updating collection:', error);
  }
};


updatePostmanCollection();





const listCollections = async () => {
  try {
    const apiKey = process.env.POSTMAN_API_KEY;
    const url = 'https://api.getpostman.com/collections';

    const response = await axios.get(url, {
      headers: {
        'x-api-key': apiKey
      }
    });

    const collections = response.data.collections;
    collections.forEach(collection => {
      console.log(`Collection Name: ${collection.name}+" "+${collection.id}`);
      console.log(`Collection ID: `);
    });
  } catch (error) {
    console.log('Error listing collections:', error.message);
  }
};

// Execute the function
// listCollections();
