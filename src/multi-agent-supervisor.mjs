import "dotenv/config";

import { HumanMessage } from "@langchain/core/messages";
import { createSupervisor } from "@langchain/langgraph-supervisor";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";

import { lookupWeatherTool, lookupCityTriviaTool } from "./tools.mjs";
import model from "./model.mjs";


const weatherAgent = createReactAgent({
    name: "weather_agent",
    description: "only answer questions about weather.",
    llm: model,
    tools: [lookupWeatherTool],
    prompt: "You are a helpful assistant that can answer questions about weather. You have to call the lookup_weather tool to get the weather for a city.",
    checkpointer: new MemorySaver(),
});

const triviaAgent = createReactAgent({
    name: "trivia_agent",
    description: "only answer questions about trivia.",
    llm: model,
    tools: [lookupCityTriviaTool],
    prompt: "You are a helpful assistant that can answer questions about trivia. You have to call the lookup_city_trivia tool to get the trivia for a city.",
    checkpointer: new MemorySaver(),
});

const workflow = createSupervisor({
    agents: [weatherAgent, triviaAgent],
    llm: model,
    prompt: `
        You are a helpful assistant that deal with choosing the right agent to answer the question. Do not answer the question yourself.
        Ask the weather, temperature, humidity, etc. for a city to use the weather_agent.
        Ask the trivia, funny knowledge about a city, famous places, history, one-line introduction to use the trivia_agent.
    `,
})

const app = workflow.compile();

const drawable = await app.getGraphAsync();
console.log(drawable.drawMermaid({ withStyles: true }));

const input = {
    messages: [
        new HumanMessage("查一下杭州的天气，再讲一条和杭州有关的小知识。"),
    ],
};

const nodePath = []
let finallState = null

const stream = await app.stream(input, {
    streamMode: ["updates", "values"],
    configurable: { thread_id: "multi-agent" },
})

for await (const event of stream) {
    const [mode, payload] = event
    if (mode === "updates" && payload) {
        console.log("payload:", payload)
        nodePath.push(...Object.keys(payload))
    } else if (mode === "values") {
        finallState = payload
        console.log("finallState:", payload)
    }
}

console.log("nodePath:", nodePath)
console.log("finallState:", finallState)


