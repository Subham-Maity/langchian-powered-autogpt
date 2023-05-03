const express = require("express");
const app = express();
const port = 3000;

// Set up API key
const dotenv = require("dotenv");
dotenv.config();
const apikey = process.env.OPENAI_API_KEY;

// Import Langchain modules
const { LLM } = require("langchain");

// Create an LLMChain object
const titleChain = new LLM(
  (temperature = 0.9),
  (apikey = apikey),
  (prompt = new Prompt(
    (input_variables = ["topic"]),
    (template = "write me a youtube video title about {topic}")
  )),
  (verbose = true),
  (output_key = "title"),
  (memory = new ConversationBufferMemory(
    (input_key = "topic"),
    (memory_key = "chat_history")
  ))
);

// Create a ScriptChain object
const scriptChain = new LLM(
  (temperature = 0.9),
  (apikey = apikey),
  (prompt = new Prompt(
    (input_variables = ["title", "wikipedia_research"]),
    (template =
      "write me a youtube video script based on this title TITLE: {title} while leveraging this wikipedia reserch:{wikipedia_research}")
  )),
  (verbose = true),
  (output_key = "script"),
  (memory = new ConversationBufferMemory(
    (input_key = "title"),
    (memory_key = "chat_history")
  ))
);

// Create a WikipediaAPIWrapper object
const wiki = new WikipediaAPIWrapper();

// Create an Express app
app.get("/", (req, res) => {
  // Get the prompt from the query string
  const prompt = req.query.prompt;

  // Run the title chain
  const title = titleChain.run(prompt);

  // Run the script chain
  const script = scriptChain.run(title, wiki.run(prompt));

  // Render the HTML page
  res.render("index.html", { title, script });
});

// Start the server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
