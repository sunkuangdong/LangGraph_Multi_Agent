import { Annotation, END, START, StateGraph, MemorySaver } from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
    visitCount: Annotation({
        reducer: (_prev, next) => next,
        default: ()=> 0,
    }),
    message: Annotation({
        reducer: (_prev, next) => next,
        default: ()=> "",
    }),
})

function recordVisit(state) {
    const visitCount = state.visitCount + 1;
    const message = 
        visitCount === 1 ? "first visit" :
        `visit ${visitCount} times`;
    return {
        visitCount,
        message,
    }
}

const graph = new StateGraph(StateAnnotation)
    .addNode("recordVisit", recordVisit)
    .addEdge(START, "recordVisit")
    .addEdge("recordVisit", END)

const checkpointer = new MemorySaver();
const app = graph.compile({ checkpointer });

const user1 = {
    configurable: {
        thread_id: "user1: zhang",
    },
}
const user2 = {
    configurable: {
        thread_id: "user2: li",
    },
}

const res1 = await app.invoke({}, user1);
const res2 = await app.invoke({}, user1);
const res3 = await app.invoke({}, user1);
const res4 = await app.invoke({}, user2);

console.log("res1:", res1);
console.log("res2:", res2);
console.log("res3:", res3);
console.log("res4:", res4);