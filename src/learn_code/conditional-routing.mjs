import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
    query: Annotation({
        reducer: (_prev, next) => next,
        default: ()=> "",
    }),
    route: Annotation({
        reducer: (_prev, next) => next,
        default: ()=> "chat",
    }),
    answer: Annotation({
        reducer: (_prev, next) => next,
        default: ()=> "",
    }),
})

const router = (state) => {
    const isMath = /[+\-*/]/.test(state.query);
    return {
        route: isMath ? "math" : "chat",
    };
};

const mathNode = (state) => {
    try {
        return {
            answer: String(eval(state.query)),
        };
    } catch (error) {
        return {
            answer: "Can not evaluate the expression: " + error.message,
        };
    }
};

const chatNode = (state) => (
    {
        answer: `You said: ${state.query}`,
    }
)

const graph = new StateGraph(StateAnnotation)
    .addNode("router", router)
    .addNode("math", mathNode)
    .addNode("chat", chatNode)
    .addEdge(START, "router")
    .addConditionalEdges(
        "router", 
        (state) => state.route,
        {
            math: "math",
            chat: "chat",
        }
    )
    .addEdge("math", END)
    .addEdge("chat", END)
    .compile();

const drawable = await graph.getGraphAsync()
const mermaid = drawable.drawMermaid({ withStyles: true })
console.log(mermaid)

const result1 = await graph.invoke({ query: "1 + 1" })
console.log("result1:", result1)

const result2 = await graph.invoke({ query: "What is the capital of France?" })
console.log("result2:", result2)
