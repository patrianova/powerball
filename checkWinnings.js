/**
 * Powerball Ticket Checker
 * 
 * Personal tool to automatically check Powerball tickets using AI vision.
 * Takes photos of lottery receipts and compares them against the latest winning numbers.
 * 
 * Built by Rodrigo Patrianova to solve the tedious problem of manually checking
 * multiple lottery tickets after each drawing.
 * 
 * @author Rodrigo Patrianova
 * @version 1.0.0
 * @license MIT
 * 
 * DISCLAIMER: This software is provided "as is" without warranty.
 * Always verify results through official lottery channels. Use at your own risk.
 */

const axios = require("axios");
const cheerio = require("cheerio");
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Initialize Anthropic client with API key from environment
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Powerball match types for winner detection
 * Used to identify different levels of matches without showing prize amounts
 */
const MATCH_TYPES = {
  '5+PB': { match: '5 + Powerball', description: 'All 5 numbers + Powerball' },
  '5': { match: '5 numbers', description: 'All 5 numbers' },
  '4+PB': { match: '4 + Powerball', description: '4 numbers + Powerball' },
  '4': { match: '4 numbers', description: '4 numbers' },
  '3+PB': { match: '3 + Powerball', description: '3 numbers + Powerball' },
  '3': { match: '3 numbers', description: '3 numbers' },
  '2+PB': { match: '2 + Powerball', description: '2 numbers + Powerball' },
  '1+PB': { match: '1 + Powerball', description: '1 number + Powerball' },
  'PB': { match: 'Powerball only', description: 'Powerball only' }
};

/**
 * Fetches the latest Powerball drawing results from the official website
 * 
 * @returns {Object|null} Latest drawing result with date, numbers, powerball, and powerPlay
 * @returns {string} returns.date - Drawing date (e.g., "Wed, Sep 3, 2025")
 * @returns {number[]} returns.numbers - Array of 5 winning numbers (1-69)
 * @returns {number} returns.powerball - Powerball number (1-26)
 * @returns {string} returns.powerPlay - Power Play multiplier (e.g., "2x", "3x")
 */
async function fetchLatestPowerballResult() {
  try {
    console.log('🌐 Fetching latest Powerball results...');
    const url = "https://www.powerball.com/previous-results";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const draws = [];
    
    // Parse the most recent drawing from the results page
    $('a[href*="draw-result"]').each((i, el) => {
      if (i < 1) { // Only get the most recent drawing
        const $link = $(el);
        const text = $link.text().trim();
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length >= 7) {
          const date = lines[0];
          const numbers = lines.slice(1, 6).map(n => parseInt(n, 10));
          const powerball = parseInt(lines[6], 10);
          let powerPlay = '';
          
          // Extract Power Play multiplier if available
          const powerPlayIndex = lines.findIndex(line => line.toLowerCase().includes('power play'));
          if (powerPlayIndex !== -1 && powerPlayIndex + 1 < lines.length) {
            powerPlay = lines[powerPlayIndex + 1];
          }
          
          draws.push({ date, numbers, powerball, powerPlay });
        }
      }
    });

    return draws[0] || null;
  } catch (err) {
    console.error("❌ Error fetching latest results:", err.message);
    return null;
  }
}

/**
 * Reads lottery ticket numbers from a receipt image using Claude AI Vision
 * 
 * @param {string} imagePath - Absolute path to the receipt image file
 * @returns {Array|null} Array of ticket objects or null if reading fails
 * @returns {string} returns[].line - Ticket line identifier (A, B, C, etc.)
 * @returns {number[]} returns[].mainNumbers - Array of 5 main numbers (1-69)
 * @returns {number} returns[].powerball - Powerball number (1-26)
 */
async function readReceiptNumbers(imagePath) {
  try {
    // Validate API key is provided
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('❌ Please set your ANTHROPIC_API_KEY environment variable');
      console.log('   Get your API key from: https://console.anthropic.com/');
      return null;
    }

    console.log(`🔍 Reading receipt with Claude Vision: ${path.basename(imagePath)}`);
    
    // Read and encode image file
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Determine media type from file extension
    const ext = path.extname(imagePath).toLowerCase();
    const mediaType = ext === '.png' ? 'image/png' : 
                     ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                     'image/png';

    // Call Claude Vision API to read the receipt
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text: `Please read this Powerball lottery receipt very carefully. I can see the ticket lines clearly labeled A through J.

Each line shows:
[Letter]. [5 main numbers] QP [powerball number] QP

For example: "A. 02 05 30 38 42 QP 01 QP"

CRITICAL: Read each number exactly as printed. Numbers like "09" should become 9, "02" should become 2.

Please extract ALL visible ticket lines and return as JSON:

{
  "tickets": [
    {
      "line": "A",
      "mainNumbers": [2, 5, 30, 38, 42],
      "powerball": 1
    }
  ]
}

Return ONLY the JSON, no markdown, no explanations.`
          }
        ]
      }]
    });

    const responseText = message.content[0].text;
    
    // Clean up the response - remove markdown code blocks if present
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
    
    const data = JSON.parse(cleanedResponse);
    
    if (data.tickets && data.tickets.length > 0) {
      console.log(`\n🎫 Found ${data.tickets.length} ticket(s) on receipt:`);
      data.tickets.forEach((ticket) => {
        console.log(`  ${ticket.line}. ${ticket.mainNumbers.join(' ')} | Powerball: ${ticket.powerball}`);
      });
      return data.tickets;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error reading receipt:', error.message);
    return null;
  }
}

/**
 * Analyzes a single ticket against the winning numbers
 * 
 * @param {Object} ticket - Ticket object with line, mainNumbers, and powerball
 * @param {Object} latestResult - Latest drawing result
 * @returns {Object} Analysis result with match details and prize information
 */
function analyzeTicket(ticket, latestResult) {
  const mainMatches = ticket.mainNumbers.filter(num => latestResult.numbers.includes(num)).length;
  const powerballMatch = ticket.powerball === latestResult.powerball;
  
  // Determine match type based on matches
  let matchKey = '';
  if (mainMatches === 5 && powerballMatch) matchKey = '5+PB';
  else if (mainMatches === 5) matchKey = '5';
  else if (mainMatches === 4 && powerballMatch) matchKey = '4+PB';
  else if (mainMatches === 4) matchKey = '4';
  else if (mainMatches === 3 && powerballMatch) matchKey = '3+PB';
  else if (mainMatches === 3) matchKey = '3';
  else if (mainMatches === 2 && powerballMatch) matchKey = '2+PB';
  else if (mainMatches === 1 && powerballMatch) matchKey = '1+PB';
  else if (powerballMatch) matchKey = 'PB';
  
  const matchType = matchKey ? MATCH_TYPES[matchKey] : null;
  
  return {
    ticket,
    mainMatches,
    powerballMatch,
    matchingNumbers: ticket.mainNumbers.filter(num => latestResult.numbers.includes(num)),
    matchType,
    isWinner: !!matchType
  };
}

/**
 * Main function that orchestrates the entire lottery checking process
 * Fetches latest results, reads receipt images, and analyzes for winners
 */
async function checkAllWinnings() {
  try {
    // Get latest Powerball results
    const latestResult = await fetchLatestPowerballResult();
    if (!latestResult) {
      console.log('❌ Could not fetch latest Powerball results');
      return;
    }
    
    // Display latest winning numbers
    console.log('\n🏆 LATEST WINNING NUMBERS:');
    console.log(`📅 ${latestResult.date}`);
    console.log(`🔢 Numbers: ${latestResult.numbers.join(' ')}`);
    console.log(`🎱 Powerball: ${latestResult.powerball}`);
    console.log(`⚡ Power Play: ${latestResult.powerPlay}`);
    
    // Find and process receipt images
    const imagesDir = path.join(__dirname, 'images');
    
    if (!fs.existsSync(imagesDir)) {
      console.log('\n❌ Images directory not found. Please add receipt images to ./images/');
      return;
    }
    
    const files = fs.readdirSync(imagesDir)
      .filter(file => /\.(jpg|jpeg|png|gif|bmp)$/i.test(file));
    
    if (files.length === 0) {
      console.log('\n❌ No receipt images found in ./images/');
      return;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎫 CHECKING YOUR TICKETS...');
    console.log('='.repeat(80));
    
    let totalWinningTickets = 0;
    
    // Process each receipt image
    for (const file of files) {
      const imagePath = path.join(imagesDir, file);
      console.log(`\n📷 Processing: ${file}`);
      
      try {
        const tickets = await readReceiptNumbers(imagePath);
        
        if (!tickets || tickets.length === 0) {
          console.log('   ❌ Could not read ticket numbers from this image');
          continue;
        }
        
        console.log(`\n📊 MATCH ANALYSIS:`);
        console.log('-'.repeat(60));
        
        // Analyze each ticket for matches
        tickets.forEach((ticket) => {
          const analysis = analyzeTicket(ticket, latestResult);
          
          console.log(`\n${ticket.line}. Your numbers: ${ticket.mainNumbers.join(' ')} | PB: ${ticket.powerball}`);
          
          if (analysis.isWinner) {
            console.log(`   🎉 WINNER! ${analysis.matchType.match}`);
            console.log(`   ✓ Matched ${analysis.mainMatches} main number(s) + ${analysis.powerballMatch ? 'Powerball' : 'no Powerball'}`);
            console.log(`   💰 Check official sources for prize amounts`);
            totalWinningTickets++;
          } else if (analysis.mainMatches > 0 || analysis.powerballMatch) {
            console.log(`   📍 Partial match: ${analysis.mainMatches} main number(s) + ${analysis.powerballMatch ? 'Powerball' : 'no Powerball'}`);
            if (analysis.matchingNumbers.length > 0) {
              console.log(`   🔢 Matching numbers: ${analysis.matchingNumbers.join(', ')}`);
            }
            if (analysis.powerballMatch) {
              console.log(`   🎱 Powerball matches!`);
            }
          } else {
            console.log(`   ❌ No matches`);
          }
        });
        
      } catch (error) {
        console.log(`   ❌ Error processing ${file}: ${error.message}`);
      }
    }
    
    // Display final results
    console.log('\n' + '='.repeat(80));
    if (totalWinningTickets > 0) {
      console.log(`🎊 CONGRATULATIONS! You have ${totalWinningTickets} winning ticket(s) total!`);
    } else {
      console.log(`😔 No winning tickets found. Better luck next draw!`);
    }
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  checkAllWinnings();
}

// Export functions for testing or use as a module
module.exports = { 
  checkAllWinnings, 
  fetchLatestPowerballResult, 
  readReceiptNumbers,
  analyzeTicket 
};