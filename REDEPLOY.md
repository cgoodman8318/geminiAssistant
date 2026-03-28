# Redeployment Guide: JW Automation Tools

Follow these steps to set up this toolkit on a new machine.

## 1. Prerequisites
- **Node.js** (v18 or later recommended)
- **git**
- **PowerShell** (for Windows users)

## 2. Initial Setup
Clone the repository and install local dependencies:
```bash
git clone <repository-url>
cd Tooling
npm install
```

## 3. Global Installation
Install the tools and skills globally to your user level:
```bash
# Install CLI tools (kokoro-tts, jw-scraper-daily, etc.)
npm run install-tools

# Install Gemini skills
npm run install-skills

# Install Playwright browsers (required for scraping)
npx playwright install chromium
```

## 4. Environment Variables
To ensure the tools work correctly from any directory, you should set the following environment variables in your system:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `KOKORO_SERVER_URL` | URL of the Kokoro TTS server | `http://192.168.1.68:5000` |
| `PODCAST_OUTPUT_DIR` | Where to save generated podcasts | `~/Documents/Podcasts` |

### Setting variables on Windows (PowerShell):
```powershell
[System.Environment]::SetEnvironmentVariable('KOKORO_SERVER_URL', 'http://YOUR_IP:5000', 'User')
[System.Environment]::SetEnvironmentVariable('PODCAST_OUTPUT_DIR', 'C:\Path\To\Your\Podcasts', 'User')
```

## 5. Verification
Test the tools to ensure they are working:
```bash
# Check if commands are in PATH
where kokoro-tts
where jw-scraper-daily

# Run a quick test
jw-scraper-daily daily --date 2026/03/28
```

## 6. Updating
To push updates from this repository to your global installation after making changes:
```bash
npm run install-tools
npm run install-skills
```
