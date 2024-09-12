const aiClient = require('../setup/openai');

async function makeAiRequest(systemContent, userContent) {
  const response = await aiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: `"""${userContent}"""` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.25,
  });

  return response.choices[0].message.content;
}

const categories = ['type', 'brand', 'model', 'color', 'description'];

const systemMessage = `You are a manager of a Lost and Found department. Your catalogue has these categories: ${categories.join(
  ', '
)}. If the type of item is not provided, you can infer it, based on the rest of the information. 

Any category not provided, should be marked as null.
The response should be in JSON format.`;

async function parseKeywords(keywords) {
  const parseKeywordsMessage = `${systemMessage}
  
  User input will be between triple double-quotes and it is a comma-separated list of keywords.
  You need to parse the user input and place the keywords in the correct category.`;

  const response = await makeAiRequest(parseKeywordsMessage, keywords);
  return JSON.parse(response);
}

async function parseUserMessage(message) {
  const userMessage = `${systemMessage}
  
  Break down the user input into the categories provided.`;

  const response = await makeAiRequest(userMessage, message);
  return JSON.parse(response);
}

async function matchProductDescription(productDescription, descriptions) {
  const matchDescriptionMessage = `You have an array of descriptions and you need to find a match in the one that looks more alike to the product description provided by the user input.
  The response should be the index of the matching description or -1 if no match is found.
  The response should be in JSON format, like { "match_index": <index> }.
  
  User input will be between triple double-quotes and it will be the product description.

  Here is the array of descriptions: ${JSON.stringify(descriptions)}`;

  const response = await makeAiRequest(matchDescriptionMessage, productDescription);
  return JSON.parse(response);
}

module.exports = {
  parseKeywords,
  matchProductDescription,
  parseUserMessage,
};
