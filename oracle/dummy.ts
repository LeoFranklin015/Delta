console.log(
  JSON.stringify([
    {
      type: "function",
      function: {
        name: "websearch",
        description: "Search the web for current information",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query",
            },
          },
          required: ["query"],
        },
      },
    },
  ])
);
