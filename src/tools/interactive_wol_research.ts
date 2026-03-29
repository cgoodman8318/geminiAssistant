#!/usr/bin/env node --import tsx

async function main() {
    console.log("====================================================");
    console.log("   WOL Interactive Research Tool (via Gemini MCP)   ");
    console.log("====================================================");
    console.log("\nThis tool is now integrated with the Gemini CLI.");
    console.log("You no longer need to launch a separate Chrome window.");
    console.log("\nTo start researching, simply ask Gemini in your terminal:");
    console.log('   "Search for [topic] on wol.jw.org"');
    console.log('   "Look up Revelation 11:18 on WOL"');
    console.log("\nGemini will automatically:");
    console.log("1. Launch a managed Chrome browser window.");
    console.log("2. Navigate to wol.jw.org.");
    console.log("3. Perform searches and extract content based on your request.");
    console.log("\n(Note: The window may take a few seconds to appear.)");
    console.log("====================================================");
}

main().catch(console.error);
