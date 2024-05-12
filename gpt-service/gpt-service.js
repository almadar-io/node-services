const express = require("express");
const axios = require("axios");

const chatGPTService = function(config) {
  var apiRoutes = express.Router();
  const openai_key = config.get("openai.key");

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
          model: "gpt-4",
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

  return apiRoutes;
};

module.exports = chatGPTService;