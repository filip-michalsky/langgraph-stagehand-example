import { Stagehand } from "@browserbasehq/stagehand";
import {
  StagehandActTool,
  StagehandNavigateTool,
} from "@langchain/community/agents/toolkits/stagehand";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

async function main() {
  // Initialize Stagehand once and pass it to the tools
  const stagehand = new Stagehand({
    env: "LOCAL",
    enableCaching: true,
    headless: false, // Set to false to see the browser
    verbose: 1, // Set verbosity level
  });

  // Initialize Stagehand - this is important!
  await stagehand.init({ modelName: "gpt-4o" });

  console.log("Stagehand initialized successfully");

  const actTool = new StagehandActTool(stagehand);
  const navigateTool = new StagehandNavigateTool(stagehand);

  // Initialize the model
  const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0,
  });

  // Create the agent using langgraph
  const agent = createReactAgent({
    llm: model,
    tools: [actTool, navigateTool],
  });

  // Execute the agent using streams
  const inputs1 = {
    messages: [
      {
        role: "user",
        content: "Navigate to https://www.google.com",
      },
    ],
  };

  const stream1 = await agent.stream(inputs1, {
    streamMode: "values",
  });

  for await (const { messages } of stream1) {
    const msg =
      messages && messages.length > 0
        ? messages[messages.length - 1]
        : undefined;
    if (msg?.content) {
      console.log(msg.content);
    } else if (msg?.tool_calls && msg.tool_calls.length > 0) {
      console.log(msg.tool_calls);
    } else {
      console.log(msg);
    }
  }

  const inputs2 = {
    messages: [
      {
        role: "user",
        content: "Search for 'OpenAI', use the act tool to search",
      },
    ],
  };

  const stream2 = await agent.stream(inputs2, {
    streamMode: "values",
  });

  for await (const { messages } of stream2) {
    const msg =
      messages && messages.length > 0
        ? messages[messages.length - 1]
        : undefined;
    if (msg?.content) {
      console.log(msg.content);
    } else if (msg?.tool_calls && msg.tool_calls.length > 0) {
      console.log(msg.tool_calls);
    } else {
      console.log(msg);
    }
  }

  // Clean up at the end
  await stagehand.context.close();
  console.log("Session closed successfully");
}

main().catch(error => {
  console.error("Error in main execution:", error);
  process.exit(1);
});