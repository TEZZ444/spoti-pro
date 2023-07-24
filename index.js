const axios = require("axios");

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

async function getSpotifyAccessToken(clientId, clientSecret) {
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching Spotify access token:", error.message);
    return null;
  }
}

async function searchSpotify(query, accessToken, limit = 1, country = "IN") {
  try {
    if (limit < 1 || limit > 20) {
      throw new Error("Limit must be between 1 and 20.");
    }

    const response = await axios.get(`${SPOTIFY_API_BASE_URL}/search`, {
      params: {
        q: query,
        type: "track",
        limit: limit,
        market: country,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const trackItems = response.data?.tracks?.items || [];
    const trackUrls = trackItems.map(
      (item) => item?.external_urls?.spotify || null
    );

    if (trackUrls.length === 0) {
      throw new Error("No tracks found for the given query.");
    }

    return trackUrls;
  } catch (error) {
    console.error("Error searching Spotify:", error.message);
    throw error; 
  }
}

module.exports = { getSpotifyAccessToken, searchSpotify };