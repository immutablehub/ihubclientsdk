import {
  Agent,
  run,
  webSearchTool,
  MCPServerStreamableHttp,
  OpenAIProvider,
  setTracingDisabled,
  setDefaultModelProvider,
} from "@openai/agents";

setTracingDisabled(true);

export default async function Runner(spec, inputs) { 



  console.log("input")
  console.log(inputs)

  //console.log("spec in runner")
  //console.log(spec)
  const outputKey = Object.keys(spec.outputs.data)[0];
  const tools = [];
  const mcpServers = [];
  let value =""
  for (const secretName of Object.keys(spec.secrets ?? {})) {
      value = process.env[secretName];
}
  
  // Built-in tools + MCP servers
  if (Array.isArray(spec.tools)) {
    for (const tool of spec.tools) {
      // Built-in Web Search
      if (tool === "web") {
        tools.push(webSearchTool());
      }

      // Remote MCP Server
      else if (typeof tool === "object" && tool.url) {
        const server = new MCPServerStreamableHttp({
          url: "https://api.githubcopilot.com/mcp/",
          requestInit: {
          headers: {
          Authorization: `Bearer ${value}`,
        },
      }
        });

        await server.connect();
        mcpServers.push(server);
      }
    }
  }

  let modelProvider;

  switch (spec.runtime.provider){

    case "openrouter":

      modelProvider = new OpenAIProvider({
      baseURL:"",
      apiKey: "",
      useResponses: false,
    });
    break;

  case "openai":
    break;

  case "groq":


      modelProvider = new OpenAIProvider({
      baseURL:"https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
      useResponses: false,
    });


  }

  setDefaultModelProvider(modelProvider);

    const agent = new Agent({
      name: spec.name,
      instructions: spec.prompt,
      model: spec.runtime.model,
      tools,
      mcpServers,
  });

  try {
    
    const result = await run(agent, inputs,{modelProvider,tracing:false});

    return {
      data: {
        [outputKey]: result.finalOutput,
      },
    };
  } finally {
    // Always close MCP connections
    for (const server of mcpServers) {
      await server.close();
    }
  }
}
