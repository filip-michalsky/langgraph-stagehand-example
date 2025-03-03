import { Stagehand } from "@browserbasehq/stagehand";
// import { StagehandActTool, StagehandNavigateTool } from "@langchain/community/agents/toolkits/stagehand";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import {
    Tool
  } from "@langchain/core/tools";

  
export class LazyStagehand {
    private stagehand: Stagehand;
    private initialized: Promise<void>;

    constructor() {
        this.stagehand = new Stagehand({
            env: "LOCAL",
            enableCaching: true,
        });
        // Start initialization in the background
        this.initialized = this.stagehand.init().then(() => {});
    }

    getStagehand() {
        return this.stagehand;
    }

    async ensureInitialized() {
        await this.initialized; // Wait for initialization to complete if not already done
    }
}
//  Documentation is here:
//  https://js.langchain.com/docs/integrations/tools/stagehand

export abstract class StagehandToolBase extends Tool {
    protected stagehand?: LazyStagehand;

    private localStagehand?: LazyStagehand;
    private logger?: Logger;

    constructor(stagehandInstance?: LazyStagehand) {
        super();
        this.stagehand = stagehandInstance;
    }

    protected async getStagehand(): Promise<Stagehand> {
        if (this.stagehand) {
            await this.stagehand.ensureInitialized();
            return this.stagehand.getStagehand();
        }

        if (!this.localStagehand) {
            this.localStagehand = new LazyStagehand();
            await this.localStagehand.ensureInitialized();
        }
        return this.localStagehand.getStagehand();
    }

    protected getLogger() {
        if (!this.logger) {
            this.logger = createLogger(this.getName());
        }
        return this.logger;
    }
}

export class StagehandNavigateTool extends StagehandToolBase {
    name = "stagehand_navigate";
  
    description =
      "Use this tool to navigate to a specific URL using Stagehand. The input should be a valid URL as a string.";
  
    async _call(input: string): Promise<string> {
      const stagehand = await this.getStagehand();
      try {
        await stagehand.page.goto(input);
        return `Successfully navigated to ${input}.`;
      } catch (error: unknown) {
        const message = isErrorWithMessage(error) ? error.message : String(error);
        return `Failed to navigate: ${message}`;
      }
    }
  }
  
  export class StagehandActTool extends StagehandToolBase {
    name = "stagehand_act";
  
    description =
      "Use this tool to perform an action on the current web page using Stagehand. The input should be a string describing the action to perform.";
  
    async _call(input: string): Promise<string> {
      const stagehand = await this.getStagehand();
      const result = await stagehand.act({ action: input });
      if (result.success) {
        return `Action performed successfully: ${result.message}`;
      } else {
        return `Failed to perform action: ${result.message}`;
      }
    }
  }

const lazyStagehand = new LazyStagehand();
const actTool = new StagehandActTool(lazyStagehand);
const navigateTool = new StagehandNavigateTool(lazyStagehand);

// Initialize the model
const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0,
});

// Create the agent using langgraph
const testAgent = createReactAgent({
    llm: model,
    tools: [actTool, navigateTool],
});

export { testAgent };