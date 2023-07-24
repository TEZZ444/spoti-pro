# spoti-pro
A Helper To Get The URL From Spotify!

## Quick Example

```javascript
const { getSpotifyAccessToken, searchSpotify } = require("spoti-pro");

const clientId = "YOUR_CLIENT_ID";
const clientSecret = "YOUR_CLIENT_SECRET";
const q = "Shiddat";
const limit = 5;
const country = "IN";

async function run() {
  try {
    const accessToken = await getSpotifyAccessToken(clientId, clientSecret);
    const trackUrl = await searchSpotify(q, accessToken, limit, country);
    console.log("Track URL:", trackUrl[0]);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();

// No Function
//  try {
//     const accessToken = await getSpotifyAccessToken(clientId, clientSecret);
//     const trackUrl = await searchSpotify(q, accessToken, limit,country);
//     console.log("Track URL:", trackUrl[0]);
//   } catch (error) {
//     console.error("Error:", error);
//   }
```
