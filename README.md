# 🎲 Powerball Ticket Checker

This Powerball checker was created to solve a personal problem I had: manually checking dozens of Powerball tickets after each drawing. As someone who occasionally buys multiple quick-pick tickets, I got tired of squinting at tiny numbers and cross-referencing them with the winning numbers.

So I built this tool using Claude AI's vision capabilities to automatically read lottery receipts and check them against the latest Powerball results. Now I just take a photo of my tickets and let the AI do all the tedious work.

## ✨ Features

- **🤖 AI-Powered Receipt Reading**: Uses Claude AI Vision to read ticket numbers from photos
- **🌐 Real-Time Results**: Fetches the latest Powerball drawing results automatically
- **🎯 Match Detection**: Shows exactly which numbers matched
- **📱 Multiple Images**: Processes all receipt photos at once
- **🔍 Clear Results**: Easy-to-read output showing all your matches

## 🛠️ Installation

1. **Download or clone this project**
   ```bash
   # If downloading from a repository:
   # git clone <repository-url>
   # cd powerball
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your Anthropic API key**
   ```bash
   export ANTHROPIC_API_KEY="your-claude-api-key-here"
   ```
   
   Get your API key from [Anthropic Console](https://console.anthropic.com/)

4. **Create images directory**
   ```bash
   mkdir images
   ```

## 🚀 Step-by-Step Usage Guide

### Step 1: Get Your Anthropic API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to the API section
4. Generate a new API key
5. Copy the API key (starts with `sk-ant-api03-...`)

### Step 2: Set Up Environment
1. **Set your API key as an environment variable**:
   ```bash
   # On macOS/Linux:
   export ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
   
   # On Windows (Command Prompt):
   set ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   
   # On Windows (PowerShell):
   $env:ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
   ```

2. **Verify your API key is set**:
   ```bash
   # On macOS/Linux:
   echo $ANTHROPIC_API_KEY
   
   # On Windows:
   echo %ANTHROPIC_API_KEY%
   ```

### Step 3: Prepare Your Lottery Receipts
1. **Take clear photos** of your lottery receipts
   - Good lighting is essential
   - Keep receipt flat and straight
   - Ensure all numbers are clearly visible
2. **Save images** to the `images/` folder
   - Supported formats: JPG, JPEG, PNG, GIF, BMP
   - Any filename works (e.g., `powerball1.jpg`, `ticket.png`)

### Step 4: Run the Checker
1. **Open your terminal/command prompt** in the project folder
2. **Run the script**:
   ```bash
   node checkWinnings.js
   ```
   OR
   ```bash
   npm start
   ```

### Step 5: Review Your Results
The script will automatically:
1. 🌐 Fetch the latest Powerball winning numbers
2. 🔍 Read your receipt images using Claude AI Vision
3. 📊 Analyze each ticket for matches
4. 💰 Show any winnings and prize amounts

**That's it!** The entire process is automated once you run the command.

## 📊 Sample Output

```
🏆 LATEST WINNING NUMBERS:
📅 Wed, Sep 3, 2025
🔢 Numbers: 3 16 29 61 69
🎱 Powerball: 22
⚡ Power Play: 2x

================================================================================
🎫 CHECKING YOUR TICKETS...
================================================================================

📷 Processing: powerball.png.jpg
🔍 Reading receipt with Claude Vision: powerball.png.jpg

🎫 Found 10 ticket(s) on receipt:
  A. 2 5 30 38 42 | Powerball: 1
  B. 36 49 53 54 62 | Powerball: 5
  E. 9 29 38 40 52 | Powerball: 23
  H. 10 16 21 37 61 | Powerball: 23

📊 MATCH ANALYSIS:
------------------------------------------------------------

E. Your numbers: 9 29 38 40 52 | PB: 23
   📍 Partial match: 1 main number(s) + no Powerball
   🔢 Matching numbers: 29

H. Your numbers: 10 16 21 37 61 | PB: 23
   📍 Partial match: 2 main number(s) + no Powerball
   🔢 Matching numbers: 16, 61

================================================================================
😔 No winning tickets found. Better luck next draw!
================================================================================
```

## 🎯 What Gets Detected

The tool will identify these winning combinations:

| Match | Description |
|-------|-------------|
| 5 + Powerball | All 5 numbers + Powerball |
| 5 numbers | All 5 numbers |
| 4 + Powerball | 4 numbers + Powerball |
| 4 numbers | 4 numbers |
| 3 + Powerball | 3 numbers + Powerball |
| 3 numbers | 3 numbers |
| 2 + Powerball | 2 numbers + Powerball |
| 1 + Powerball | 1 number + Powerball |
| Powerball only | Powerball only |

For actual prize amounts, check the official Powerball website.

## 🔧 Technical Details

### Dependencies

- **axios**: HTTP client for fetching Powerball results
- **cheerio**: Server-side HTML parsing
- **@anthropic-ai/sdk**: Claude AI Vision API client

### Architecture

- `fetchLatestPowerballResult()`: Scrapes latest results from powerball.com
- `readReceiptNumbers()`: Uses Claude Vision to read lottery receipts
- `analyzeTicket()`: Compares ticket numbers against winning numbers
- `checkAllWinnings()`: Main orchestration function

### File Structure

```
powerball/
├── checkWinnings.js     # Main application file
├── images/              # Directory for receipt images
├── package.json         # Project dependencies
├── package-lock.json    # Locked dependency versions
└── README.md           # This file
```

## 🔒 Security & Privacy

- ✅ **No hardcoded API keys** - Uses environment variables only
- ✅ **Local processing** - Images are processed locally and sent securely to Claude API
- ✅ **No data storage** - No lottery numbers or personal data is stored
- ✅ **Secure API calls** - Uses official Anthropic SDK with proper authentication

## 🐛 Troubleshooting

### Common Issues

**"Please set your ANTHROPIC_API_KEY environment variable"**
- Solution: Get an API key from [Anthropic Console](https://console.anthropic.com/) and set it as an environment variable

**"No receipt images found in ./images/"**
- Solution: Add your lottery receipt images to the `images/` directory

**"Could not read ticket numbers from this image"**
- Solution: Ensure image is clear, well-lit, and shows the ticket numbers clearly

**"Error fetching latest results"**
- Solution: Check your internet connection; the app needs to access powerball.com

### Image Quality Tips

- 📸 Use good lighting when photographing receipts
- 🔍 Ensure all ticket numbers are clearly visible
- 📐 Keep the receipt flat and straight
- 🎯 Focus on the ticket number section

## 🤝 Contributing

Feel free to fork this and make it your own! If you have ideas for improvements or find bugs, I'd love to hear about them.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Rodrigo Patrianova** - Built this to solve my own lottery-checking problem
- **Claude AI** - The AI that made this possible

## 🙏 Acknowledgments

- Anthropic for the Claude AI Vision API
- Official Powerball website for lottery results
- Open source community for the excellent Node.js packages

## ⚠️ Important Disclaimers

**DISCLAIMER: This software is provided "as is" without warranty of any kind.**

- 🚫 **Not Responsible for Misuse**: The author (Rodrigo Patrianova) is not responsible for any misuse of this software
- ❌ **No Guarantee of Accuracy**: The author is not responsible for any false information this software may provide
- 🎯 **Entertainment Purpose Only**: This tool is for entertainment and convenience purposes only
- ✅ **Always Verify Officially**: Always verify your tickets through official lottery channels and retailers
- 💰 **Prize Amounts May Vary**: Prize amounts shown are approximate and may vary from actual payouts
- 🔍 **AI Reading Limitations**: AI vision may misread numbers - always double-check results manually
- ⚖️ **Use at Your Own Risk**: You assume all risks associated with using this software

**The authors are not responsible for any missed winnings, inaccurate readings, or financial losses.**

---

**🎮 Happy lottery checking!** 🍀