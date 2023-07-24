# spotify-pro
A Helper To Get The URL From Spotify!

## Quick Example

```javascript

const spotifyPro = require('spotify-pro');

// Insert Your spotify ClientId and ClientSecret
const clientId = "YOUR_SPOTIFY_CLIENT_ID";
const clientSecret = "YOUR_SPOTIFY_CLIENT_SECRET";

// Function to get the Spotify Result 
async function run() {
  const accessToken = await myStaticApi.getSpotifyAccessToken(clientId, clientSecret);
  const query = "YOUR_QUERY";
  const searchResult = await myStaticApi.searchSpotify(query, accessToken);
  console.log(searchResult);
}
run();

```
