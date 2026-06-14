import "dotenv/config";
import { HumanMessage } from "@langchain/core/messages";
import { toolNode } from "@langchain/core/tools";
import { StateGraph, START, END, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
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

const tools = [getProductStock];

const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY,
    configuration: {
        baseURL: process.env.OPENAI_BASE_URL,
    },
}).bindTools(tools);

async function agent(state) {
    const response = await llm.invoke(state.messages);
    return {
        messages: response,
    }
}

const toolNode = new ToolNode(tools);

const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", agent)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", toolsCondition, ["tools", END])
    .addEdge("tools", "agent")
    .compile();

const result = await graph.invoke({ 
    messages: [
        new HumanMessage("Check the stock of SKU-001 how many are in stock? Give me the result name and number in json format.")
    ]
});

const drawable = await graph.getGraphAsync()
const mermaid = drawable.drawMermaid({ withStyles: true })
console.log(mermaid)

const last = result.messages.at(-1);
console.log("last:", last);

