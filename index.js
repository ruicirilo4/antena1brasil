const puppeteer = require("puppeteer");
const express = require("express");
const { Browserless } = require("browserless"); // Import the browserless package
const app = express();
const port = 56189;

app.use(express.static("public"));

// Create an array to store recent songs
const recentSongs = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/now-playing", async (req, res) => {
  try {
    // Create a new browserless instance with your API token
    const browserless = new Browserless({
      token: process.env.BROWSERLESS_TOKEN, // Use your browserless API token
    });

    const artistSelector = ".Artist";
    const songSelector = ".nowPlayingLink";

    // Use browserless to open a new page
    const page = await browserless.page();

    // Navigate to the URL
    await page.goto("https://www.antena1.com.br/ouvir-radio-online");

    // Wait for the selectors to appear on the page
    await page.waitForSelector(artistSelector, { timeout: 180000 });
    await page.waitForSelector(songSelector);

    // Extract artist and song text
    const [artistText, songText] = await Promise.all([
      page.textContent(artistSelector),
      page.textContent(songSelector),
    ]);

    // Close the page
    await page.close();

    const nowPlayingInfo = `${artistText.trim()} - ${songText.trim()}`;

    // Check if the song is not already in the recentSongs array,
    // and it's not "-" or an empty string before adding it
    if (nowPlayingInfo !== "-" && nowPlayingInfo !== "" && !recentSongs.includes(nowPlayingInfo)) {
      // Add the currently playing song to the beginning of the recentSongs array
      recentSongs.unshift(nowPlayingInfo);

      // Ensure the recentSongs array contains a maximum of 10 songs
      if (recentSongs.length > 10) {
        recentSongs.pop(); // Remove the oldest song if there are more than 10
      }
    }

    res.send(nowPlayingInfo);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error");
  }
});

app.get("/recent-songs", (req, res) => {
  // Filter out "-" and empty string from the recentSongs array
  const filteredRecentSongs = recentSongs.filter((song) => song !== "-" && song !== "");

  // Return the filtered list of recent songs
  res.json(filteredRecentSongs);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
