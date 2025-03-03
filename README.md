# Example LangGraph Stagehand Integration

Follow these steps to run the example:

## 1. Install Dependencies

```bash
npm install
```

This will install the required packages:
- @browserbasehq/stagehand
- @langchain/community
- @langchain/openai
- @langchain/langgraph
- dotenv

## 2. Set Up Environment Variables

Create a `.env.local` file in the root directory with your OpenAI API key:

```bash
OPENAI_API_KEY=your-api-key-here
```

## 3. Configure TypeScript

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

## 4. Compile TypeScript

Compile the TypeScript file:

```bash
npx tsc run-example.ts --outDir ./dist --module NodeNext
```

## 5. Run the Example

Execute the compiled JavaScript:

```bash
node run.js
```

## Alternative Run Method

You can also run the TypeScript file directly:

```bash
npx ts-node-esm run-example.ts
```