const aiClient = require('../setup/openai');

async function makeAiRequest(systemContent, userContent) {
  const response = await aiClient.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: `"""${userContent}"""` },
    ],
  });

  return response.choices[0].message.content;
}

const categories = ['item', 'brand', 'model', 'color', 'description'];

const parseKeywordsMessage = `You are a manager of a Lost and Found department. Your catalogue has these categories: ${categories.join(
  ', '
)}. If the item is not provided, you can infer it, based on the rest of the information. Any category not provided, should be marked as null.
The response should be in JSON format.

User input will be between triple double-quotes and it will be a comma-separated list of keywords.
You need to break down those keywords and place them into the aforementioned categories.`;

async function parseKeywords(keywords) {
  const response = await makeAiRequest(parseKeywordsMessage, keywords);

  return JSON.parse(response);
}

async function matchProductDescription(productDescription, descriptions) {
  const matchDescriptionMessage = `You have an array of descriptions and you need to find the one that is more likely to be the product description provided by the user input.
  The response should be the index of the matching description or -1 if no match is found.
  
  User input will be between triple double-quotes and it will be the product description.

  Here is the array of descriptions: ${JSON.stringify(descriptions)}`;

  const response = await makeAiRequest(matchDescriptionMessage, productDescription);

  console.log({ matchDescriptionMessage, productDescription, response });

  return JSON.parse(response);
}

module.exports = {
  parseKeywords,
  matchProductDescription,
};
