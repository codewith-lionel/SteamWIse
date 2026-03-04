require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function testGroq() {
  console.log("Testing Groq API Key...");
  console.log(
    "API Key (first 20 chars):",
    process.env.GROQ_API_KEY?.substring(0, 20),
  );
  console.log("");

  try {
    console.log("Testing with llama-3.3-70b-versatile model...");
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say hello in one word" }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 10,
    });

    const response = chatCompletion.choices[0]?.message?.content || "";
    console.log(`✓ SUCCESS: ${response}`);
    console.log("Groq API is working!\n");
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}\n`);
  }
}

testGroq();
