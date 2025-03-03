# Example LangGraph Stagehand Integration

This example demonstrates how to integrate Stagehand with LangGraph using two different approaches:
1. **Local LangGraph**: Running the agent locally using TypeScript
2. **LangGraph Studio**: Running the agent using LangGraph Studio

## Project Structure

```
example-langgraph-stagehand/
├── local-langgraph/       # Files for running LangGraph locally
│   ├── run-example.ts     # TypeScript implementation
│   └── run.js             # JavaScript runner
├── langgraph-studio/      # Files for running in LangGraph Studio
│   ├── lazy.ts            # Agent definition
│   └── langgraph.json     # LangGraph Studio configuration
└── ... other project files
```

## Prerequisites

```bash
npm install
```

This will install the required packages:
- @browserbasehq/stagehand
- @langchain/community
- @langchain/openai
- @langchain/langgraph
- dotenv

## Environment Variables

Create a `.env.local` file in the root directory with your OpenAI API key:

```bash
OPENAI_API_KEY=your-api-key-here
```

## Quick Start

For convenience, we've added npm scripts to make it easier to run both implementations:

```bash
# Build the local implementation
npm run build:local

# Run the local implementation
npm run start:local

# Run the LangGraph Studio implementation
npm run start:studio
```

## Approach 1: Local LangGraph

This approach runs the agent locally using TypeScript. Files for this approach are located in the `local-langgraph` directory.

### 1. Configure TypeScript

Ensure your `tsconfig.json` has the proper ESM configuration:
```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    // other options...
  }
}
```

### 2. Compile TypeScript

Compile the TypeScript file:

```bash
npx tsc local-langgraph/run-example.ts --outDir ./dist --module NodeNext
# or
npm run build
```

### 3. Run the Example

Execute the compiled JavaScript:

```bash
node local-langgraph/run.js
# or
npm run start:local
```

## Approach 2: LangGraph Studio

This approach uses LangGraph Studio to run the agent. Files for this approach are located in the `langgraph-studio` directory.

### 1. Setup

The necessary configuration files are located in the `langgraph-studio` directory:
- `lazy.ts`: Contains the agent definition
- `langgraph.json`: Configuration for LangGraph Studio

### 2. Run with LangGraph CLI

To start the LangGraph Studio development server, run:

```bash
npx @langchain/langgraph-cli dev
# or
npm run start:studio
```

This will start the LangGraph Studio server and allow you to interact with your agent through the web UI.

### 3. Using the Agent

Once the server is running, you can:
1. Access the web UI (usually at http://localhost:3000)
2. Test and debug your agent through the interface
3. View execution traces and logs