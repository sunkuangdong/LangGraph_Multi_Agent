import "dotenv/config";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { getProductBySku } from "./inventory-mock.mjs";

const getProductStock = tool(
    async ({ sku }) => getProductBySku(sku),
    {
        name: "get_product_stock",
        description: "Get the stock of a product by SKU",
        schema: z.object({
            sku: z.string().describe("The SKU of the product"),
        }),
    }
)

const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY,
    configuration: {
        baseURL: process.env.OPENAI_BASE_URL,
    },
});

const agent = createReactAgent({
    llm: model,
    tools: [getProductStock],
    prompt: "You are a helpful assistant that can answer questions and help with tasks. You have to call the get_product_stock tool to get the stock of a product by SKU.",
    checkpointer: new MemorySaver(),
});

const result = await agent.invoke(
{
    messages: [
        new HumanMessage("Check the stock of SKU-002 how many are in stock? Give me the result name and number in json format.")
    ]
},
{
    configurable: {
        thread_id: "demo-thread",
    },
});

const drawable = await agent.getGraphAsync()
const mermaid = drawable.drawMermaid({ withStyles: true })
console.log(mermaid)

const last = result.messages.at(-1);
console.log("last:", last);



