# New Version Quick Example 

###  Newly added and search types and improved Recommendations and results!

```javascript
const SpotiPro = require("spoti-pro");

const Spotify_ID = "Your_Spotify_Id";
const Spotify_Secret = "Your_Spotify_Secret";

const spotipro = new SpotiPro(Spotify_ID, Spotify_Secret, { cacheEnabled: false }); // default set to false not ness to define

// direct search by giving type!
async function search() {
    const results = await spotipro.search({ query: "Hasi - Male Version", type: "track"});
    // types available for now  - track, album, artist , playlist
    console.log(results);
}
search();

//To Search The Track
async function searchSong(trackName) {
  const results = await spotipro.searchTrack(trackName);

  const track = results.title;
  const artist = results.artist;
  const thumbnail = results.thumbnail;
  const link = results.link;
  const artistLink = results.artistLink;
  const album = results.album;
  const duration = results.duration;
  const durationInMs = results.durationInMs;
  // for raw data -> const data = results.rawData
  console.log(`Track Name - ${track}\nArtist - ${artist}\nThumbnail - ${thumbnail}\nLink - ${link}`)//
}
searchSong("On My Way")

//For Recommendations
async function getRec(trackUrl) {
  const trackLink = await spotipro.getRecommendations(trackUrl);
  console.log(`${trackLink}`)
}
getRec("https://open.spotify.com/track/32765xcLM1fd6wQIpkN9A0?si=c02bd979415c4bd9"); // link of the spotify url of previous track

//same methods also available for artist and playlist for eg.
async function artist(artishName) {
    const results = await spotipro.searchArtist(artishName);
    // check logs and implement in code
    console.log(results);
}
artist("KR$NA"); //artist name 

// more search methods available -> searchPlaylist() , searchAlbum()
```
## Donation If you like my work <3
Link : https://www.paypal.com/paypalme/wideservices?country.x=IN&locale.x=en_GB

## To Get The Spotify Id and Secret
Link : https://developer.spotify.com/dashboard
