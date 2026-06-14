import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { lookupCityTrivia, lookupWeather } from"./simple-mock.mjs";

const lookupWeatherTool = tool(
    async ({ city }) => lookupWeather(city),
    {
        name: "lookup_weather",
        description: "Lookup the weather for a certain city",
        schema: z.object({
            city: z.string().describe("The city to lookup the weather for. e.g. Tokyo, Paris, etc."),
        }),
    }
)

const lookupCityTriviaTool = tool(
    async ({ city }) => lookupCityTrivia(city),
    {
        name: "lookup_city_trivia",
        description: "Lookup the trivia for a funny knowledge about a certain city",
        schema: z.object({
            city: z.string().describe("The city to lookup the trivia for. e.g. Tokyo, Paris, etc."),
        }),
    }
)

export { lookupWeatherTool, lookupCityTriviaTool };

