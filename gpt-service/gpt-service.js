import express from 'express';
import axios from 'axios';

const chatGPTService = function(config) {
  var apiRoutes = express.Router();
  const openai_key = process.env.OPEN_AI_KEY;
  // Post route to handle chat requests
  apiRoutes.post("/chat", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).send({ message: "Prompt is required" });
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [{
            role: "user",
            content: prompt
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${openai_key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      res.status(200).send(response.data);
    } catch (error) {
      console.error('Error calling OpenAI API:', error.response?.data || error.message);
      res.status(500).send({ message: "Failed to fetch response from OpenAI" });
    }
  });

  apiRoutes.post("/image", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).send({ message: "Prompt is required for image generation" });
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: "dall-e-2",  // Change this according to the specific DALL·E model you have access to
          prompt: prompt,
          n: 1,  // Number of images to generate
          size: "256x256"  // The desired size of images
        },
        {
          headers: {
            'Authorization': `Bearer ${openai_key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      res.status(200).send(response.data);
    } catch (error) {
      console.error('Error calling OpenAI API for images:', error.response?.data || error.message);
      res.status(500).send({ message: "Failed to fetch images from OpenAI" });
    }
  });



  return apiRoutes;
};

export default chatGPTService;
