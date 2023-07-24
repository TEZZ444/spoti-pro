# spoti-pro
A Helper To Get The URL From Spotify!

## Quick Example

```javascript
const SpotiPro = require("spoti-pro");
const clientId = "YOUR_CLIENT_ID";
const clientSecret = "YOUR_CLIENT_SECRET";

const spoti = new SpotiPro(clientId, clientSecret);
const limit = 5;
const country = "IN";

async function run() {
  try {
    const q = "YOUR_QUERY";
    const trackUrls = await spoti.searchSpotify(q, limit, country);
    console.log("Track URLs:", trackUrls[0]);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
```
## Made With <3 By Tejas Shettigar
