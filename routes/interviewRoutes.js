const express = require("express");
const Interview = require("../models/Interview");
const evaluateAnswers = require("../services/aiEvaluators");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const router = express.Router();

//temporary question
const questions = [
    "Explain JavaScript closures",
    "What is the event loop in JavaScript?",
    "What is React Virtual DOM?"
];

//get question
// router.get("/questions",(req,res)=>{
//     res.json(questions);
// })
//interview submit
router.post("/submit",async (req,res)=>{
    try{
        console.log("Request body:", req.body); // DEBUG
        const {userId, questions, answers} = req.body;
        console.log("save answer", typeof answers)
        console.log("save answer", answers)
        const aiResult = await evaluateAnswers(questions,answers)
        console.log(aiResult);
        const interview = new Interview({
            userId,
            questions,
            answers,
            aiFeedback: aiResult
        });

        await interview.save();

        res.json({
            message: "Interview Save Successfully",
            feedback: aiResult
        });
    }catch(error){
        console.error("SERVER ERROR:", error);
        res.status(500).json({
            message: error.message
        })
    }
})

router.get("/history/:userId", async (req,res)=>{
    try{
        const interviews = await Interview.find({
            userId: req.params.userId
        }).sort({createdAt:-1});
        res.json(interviews);
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        })
    }
})

router.get("/detail/:id", async (req,res)=>{
    try{
        const interview = await Interview.findById(req.params.id)
        if(!interview){
            return res.status(404).json({
                message:"Interview not found"
            });
        }
        res.json(interview);
    }catch(error){
        res.status(500).json({
            message:"Internal server error"
        })
    }
} )
//get questions
router.post("/questions", async(req,res)=>{
    try{
        const {field, difficulty} = req.body;
        const prompt = `You are an experienced technical interviewer conducting a realistic job     interview. Your role is to behave like a professional interviewer from a top tech company.  Generate 8 interview questions without number for a ${field} role, and ask like human like Alright tell me this ....
                        Keep them short and realistic like a real interview with difficulty level ${difficulty}. Generate quetion only and don't write any other thing`;

        const model = genAI.getGenerativeModel({model: "gemini-3-flash-preview"});

        const result = await model.generateContent(prompt);

        const response = await result.response;

        const questions =  response.text().split("\n").map(q => q.trim())
  .filter(q => q.length > 0);
        console.log(questions)
        res.json(questions);
    }catch(error){
        console.error(error);
        res.status(500).json({
            message: "failed to generate questions"
        })
    }
})

//follow-up questions
router.post("/followup", async (req,res)=>{
    try{
        const {question,answer} = req.body;
        const prompt = `
        You are a technical interviewer.

        Question asked:
        ${question}

        Candidate answer:
        ${answer}

        Generate follow-up interview question based on the candidate's answer.
        Only return the question.
        `;
        const model = genAI.getGenerativeModel({model: "gemini-3-flash-preview"});

        const result = await model.generateContent(prompt);

        const response = await result.response;

        const followup =  response.text().split("\n").map(q => q.trim())
                            .filter(q => q.length > 0);
        
        res.json(followup);

    }
    catch(error){
        console.error(error);
        res.status(500).json({
            message: "failed to generate questions"
        })
    }
})

module.exports = router;