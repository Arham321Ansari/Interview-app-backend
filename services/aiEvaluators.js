const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function evaluateAnswers(questions, answers) {

    try {

       const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
You are a professional technical interviewer.

Evaluate the candidate answers carefully.

Questions:
${questions.join('\n')}

Answers:
${answers.join('\n')}

Provide:
1. Score out of 10
2. Short professional feedback
`;

        const result = await model.generateContent(prompt);

        const response = await result.response;

        return response.text();

    } catch (error) {
        console.error("Gemini Error:", error);
        return "AI evaluation failed";
    }
}

module.exports = evaluateAnswers;