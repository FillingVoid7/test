import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const generateQuizesByDate = async (req, res, db) => {
    try {
        const subjectName = req.query.subjectName;
        console.log("Subject Name:", subjectName);

        const { date } = req.params;
        console.log("Date:", date);

        const collection = await db.collection(subjectName);
        const document = await collection.findOne(
            { date: date },
            { projection: { content: 1, _id: 0 } }
        );

        if (!document) {
            return res.status(404).json({ message: `No content found for this date: ${date}` });
        }

        let oneString = document.content.reduce((acc, real) => {
            if (real.image_text) {
                acc += real.image_text + " ";
            }
            return acc;
        }, "").trim();

        console.log("One String:", oneString);

        if (!oneString) {
            return res.status(404).send(`No image text found to generate quiz for date: ${date}`);
        }

        const model = await genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Create and return at least 10 quiz with multiple-choice questions based on the following text. Each question should include the question, an array of 4 options and a answer. Format the output as a JSON array of objects.Ignore any images Here's the text: "${oneString}"`;

        const result = await model.generateContent(prompt);
        const quizContent = await result.response.text();

        console.log("Quiz Generated:", quizContent);

        let parsedQuiz;
        try {
            // Clean up and parse the quiz content
            const cleanedQuizContent = quizContent.replace(/```json|```/g, '').trim();
            parsedQuiz = JSON.parse(cleanedQuizContent);

            // Validate the structure of the parsed quiz
            if (!Array.isArray(parsedQuiz) || parsedQuiz.length === 0) {
                throw new Error("Invalid quiz structure");
            }
            console.log("Parsed Quiz:", parsedQuiz);
            for (const question of parsedQuiz) {
                if (!question.question || !Array.isArray(question.options) || !question.answer) {
                    throw new Error("Invalid question structure");
                }
            }
        } catch (parseError) {
            console.error("Error parsing quiz:", parseError);
            return res.status(500).json({ error: "Error parsing quiz", details: parseError.message });
        }

        res.status(200).json(parsedQuiz);
    } catch (error) {
        console.error("Error generating quiz:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};  