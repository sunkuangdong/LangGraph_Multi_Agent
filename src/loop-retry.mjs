import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
    tries: Annotation({
        reducer: (_prev, next) => next,
        default: ()=> 0,
    }),
    ok: Annotation({
        reducer: (_prev, next) => next,
        default: ()=> false,
    }),
    message: Annotation({
        reducer: (_prev, next) => next,
        default: ()=> "",
    }),
})

const attempt = (state) => {
    const tries = state.tries + 1;
    const ok = tries >= 3;
    const message = ok ? `success after ${tries} tries`:`failed after ${tries} tries, try again`;
    return {
        tries,
        ok,
        message,
    }
}

const graph = new StateGraph(StateAnnotation)
    .addNode("attempt", attempt)
    .addEdge(START, "attempt")
    .addConditionalEdges("attempt", (state) => state.ok? "done" : "attempt", {
        done: END,
        attempt: "attempt",
    })
    .compile();

const drawable = await graph.getGraphAsync()
const mermaid = drawable.drawMermaid({ withStyles: true })
console.log(mermaid)

const result = await graph.invoke({})
console.log("result:", result)
