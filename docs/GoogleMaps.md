# Google Maps & Geocoding Integration

This documentation covers the dual-track geocoding tools available in the workspace.

## 1. Overview
The geocoding integration allows for resolving physical addresses into geographical coordinates (Latitude/Longitude). It consists of a high-performance Julia CLI for batch processing and a TypeScript MCP tool for interactive use within Gemini.

## 2. Core Components

### Julia CLI (`geocoder.jl`)
- **Path**: `C:/Users/cgood/project_julia/Tooling/geocoder.jl`
- **Capabilities**:
    - Single address lookup: `--address "Reitz Union, Gainesville, FL"`
    - Batch processing: `--file addresses.txt` or `--file addresses.csv`
    - Multiple formats: `--format json` (default), `csv`, or `human`
- **Dependencies**: `HTTP.jl`, `JSON3.jl`, `ArgParse.jl`

### Gemini MCP Tool (`google-maps-mcp`)
- **Path**: `geminiAssistant/src/tools/core/google-maps-mcp/index.ts`
- **Tool Name**: `geocode_address`
- **Function**: Interactive forward geocoding directly in the Gemini CLI.

## 3. Configuration
- **API Key**: Must be stored in `.secrets/google-maps.env`.
- **Key Name**: `GOOGLE_MAPS_API_KEY`
- **Discovery**: Tools automatically walk up the directory tree to find the `.secrets` folder.

## 4. Usage Conventions
- **Campus Logic**: For UF buildings, always append "Gainesville, FL" or "UF" to improve resolution accuracy.
- **Batching**: Use the Julia CLI for processing lists larger than 50 addresses to avoid interactive timeouts.
- **Verification**: Always cross-reference the `formattedAddress` field to ensure the correct location was resolved.
