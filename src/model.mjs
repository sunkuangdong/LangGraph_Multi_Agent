import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    modelName: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY,
    configuration: {
        baseURL: process.env.OPENAI_BASE_URL,
    },
});

export default model;