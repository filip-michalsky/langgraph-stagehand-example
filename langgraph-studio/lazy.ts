import { Stagehand } from "@browserbasehq/stagehand";
// import { StagehandActTool, StagehandNavigateTool } from "@langchain/community/agents/toolkits/stagehand";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import {
    Tool,
    StructuredTool
  } from "@langchain/core/tools";
import { AnyZodObject } from "zod";
import { z } from "zod";

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

export class LazyStagehand {
    private stagehand: Stagehand;
    private initialized: Promise<void>;

    constructor() {
        this.stagehand = new Stagehand({
            env: "LOCAL",
            enableCaching: true,
        });
        // Start initialization in the background
        this.initialized = this.stagehand.init({ modelName: "gpt-4o" }).then(() => {});
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
      const result = await stagehand.page.act({ action: input });
      if (result.success) {
        return `Action performed successfully: ${result.message}`;
      } else {
        return `Failed to perform action: ${result.message}`;
      }
    }
  }
export class StagehandExtractTool extends StructuredTool {
    name = "stagehand_extract";
  
    description =
      "Use this tool to extract structured information from the current web page using Stagehand. The input should include an 'instruction' string and a 'schema' object representing the extraction schema in JSON Schema format. You have to pass in both the instruction and the schema.";
  
    schema = z.object({
      instruction: z.string().describe("Instruction on what to extract"),
      schema: z
        .record(z.any())
        .describe("Extraction schema in JSON Schema format"),
    });

    protected stagehand?: LazyStagehand;
    protected localStagehand?: LazyStagehand;
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
  
    async _call(input: {
      instruction: string;
      schema: AnyZodObject; 
    }): Promise<string> {
      try {
        const stagehand = await this.getStagehand();
        console.log("stagehand", stagehand);
        console.log(">>input to extract", input);
        const { instruction, schema } = input;
        console.log(">>instruction", instruction);
        console.log(">>schema", schema);
  
        const result = await stagehand.page.extract({
          instruction,
          schema,
        });
        console.log(">>result", result);
        return JSON.stringify(result);
      } catch (error: unknown) {
        const message = isErrorWithMessage(error) ? error.message : String(error);
        return `Failed to extract information: ${message}`;
      }
    }
  }
  
export class StagehandObserveTool extends StagehandToolBase {
    name = "stagehand_observe";
  
    description =
      "Use this tool to observe the current web page and retrieve possible actions using Stagehand. The input can be an optional instruction string.";
  
    async _call(input: string): Promise<string> {
      try {
        const stagehand = await this.getStagehand();
        const instruction = input ? input : undefined;
  
        const result = await stagehand.page.observe({ instruction });
        return JSON.stringify(result);
      } catch (error: unknown) {
        const message = isErrorWithMessage(error) ? error.message : String(error);
        return `Failed to observe: ${message}`;
      }
    }
  }

const lazyStagehand = new LazyStagehand();
const actTool = new StagehandActTool(lazyStagehand);
const navigateTool = new StagehandNavigateTool(lazyStagehand);
const extractTool = new StagehandExtractTool(lazyStagehand);
const observeTool = new StagehandObserveTool(lazyStagehand);

// Initialize the model
const model = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0,
});

// Create the agent using langgraph
const testAgent = createReactAgent({
    llm: model,
    tools: [actTool, navigateTool, extractTool, observeTool],
});

export { testAgent };