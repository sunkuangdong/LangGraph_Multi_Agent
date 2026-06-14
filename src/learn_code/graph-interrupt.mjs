import { createInterface } from "node:readline/promises";
import { Annotation, END, START, StateGraph, interrupt, MemorySaver, Command } from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
    actionSummary: Annotation({
        reducer: (_prev, next) => next,
        default: ()=> "",
    }),
    userInput: Annotation({
        reducer: (_prev, next) => next,
        default: ()=> "",
    }),
})

const showTransfer = () => ({
    actionSummary: "transfer money to zhang $100",
});

const waitConfirm  = (state) => {
    const text = interrupt({
        hint: "Please confirm the transfer",
        actionSummary: state.actionSummary,
    });
    return {
        userInput: String(text),
    };
}

const graph = new StateGraph(StateAnnotation)
    .addNode("showTransfer", showTransfer)
    .addNode("waitConfirm", waitConfirm)
    .addEdge(START, "showTransfer")
    .addEdge("showTransfer", "waitConfirm")
    .addEdge("waitConfirm", END)
    .compile({
        checkpointer: new MemorySaver(),
    });

const drawable = await graph.getGraphAsync()
const mermaid = drawable.drawMermaid({ withStyles: true })
console.log(mermaid)

const config = {
    configurable: {
        thread_id: "interrupt-demo",
    },
}

const paused = await graph.invoke({}, config);
console.log("paused for waiting user input:", paused.__interrupt__?.[0]?.value);

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});
const line = (await rl.question("> ")).trim();
await rl.close();

if (!line) {
    console.error("no input, exit");
    process.exit(1);
}
const done = await graph.invoke(new Command({ resume: line }), config);
console.log("result:", done);