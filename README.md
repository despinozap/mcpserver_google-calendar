# Base MCP server

## Inspector

While developing, you can use the inspector to debug the server. To do this:

```bash
npm run inspector
```

## Build MCP Server

Before adding the MCP server to the configuration file, you need to build it. The build process will create the given Docker tag.

```bash
npm run build
docker build -t [DOCKER_TAG_HERE] .
```

## Add MCP Server

To add the MCP server, add to the configuration replacing the fields in brackets:

```json
{
  "mcpServers": {
    "[MCP_SERVER_NAME_HERE]": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "[DOCKER_TAG_HERE]"]
    }
  }
}
```
