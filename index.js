import express from 'express';
import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import { addExtra } from 'puppeteer-extra';
import puppeteerStealth from 'puppeteer-extra-plugin-stealth';

const app = express();
const port = 56189;

app.use(express.static('public'));

// Create an array to store recent songs
const recentSongs = [];

async function setupPuppeteer() {
  const puppeteerOptions = {
    
    headless: true, // Set to true for running in headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };

  // Use stealth plugin to make Puppeteer more stealthy
  const browser = await puppeteer.launch(puppeteerOptions);
  const page = await browser.newPage();
  await page.goto('https://www.antena1.com.br/ouvir-radio-online');

  return { browser, page };
}

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: process.cwd() });
});

app.get('/now-playing', async (req, res) => {
  try {
    const { browser, page } = await setupPuppeteer();

    const artistSelector = '.Artist';
    const songSelector = '.nowPlayingLink';

    await page.waitForSelector(artistSelector, { timeout: 180000 });
    await page.waitForSelector(songSelector);

    const artistText = await page.$eval(artistSelector, (element) => element.textContent.trim());
    const songText = await page.$eval(songSelector, (element) => element.textContent.trim());

    const nowPlayingInfo = `${artistText} - ${songText}`.trim();

    // Check if the song is not already in the recentSongs array,
    // and it's not "-" or an empty string before adding it
    if (nowPlayingInfo !== '-' && nowPlayingInfo !== '' && !recentSongs.includes(nowPlayingInfo)) {
      // Add the currently playing song to the beginning of the recentSongs array
      recentSongs.unshift(nowPlayingInfo);

      // Ensure the recentSongs array contains a maximum of 10 songs
      if (recentSongs.length > 10) {
        recentSongs.pop(); // Remove the oldest song if there are more than 10
      }
    }

    // Close the browser after each request to save resources
    await browser.close();

    res.send(nowPlayingInfo);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error');
  }
});

app.get('/recent-songs', (req, res) => {
  // Filter out "-" and empty string from the recentSongs array
  const filteredRecentSongs = recentSongs.filter((song) => song !== '-' && song !== '');

  // Return the filtered list of recent songs
  res.json(filteredRecentSongs);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

    res.send(nowPlayingInfo);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error');
  }
});

app.get('/recent-songs', (req, res) => {
  // Filter out "-" and empty string from the recentSongs array
  const filteredRecentSongs = recentSongs.filter((song) => song !== '-' && song !== '');

  // Return the filtered list of recent songs
  res.json(filteredRecentSongs);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

