const axios = require("axios");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

module.exports = class SpotiPro {
    constructor(clientId, clientSecret, { cacheEnabled = false } = {}) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.tezzTokenCache = null;
        this.tezzTokenCacheExpiration = null;
        this.cacheEnabled = cacheEnabled;
    }
    /**
     * @typedef {Object} SearchOptions
     * @property {string|RegExp} query - The search query to search on Spotify. Can be a string with track name.
     * @property {string} [type] - The type of search query to search on Spotify (track, album, artist, playlist).
     */

    /**
     * Performs a search on Spotify based on the provided options.
     * @param {SearchOptions} options - The search options object to search on Spotify eg: { query: 'track name', type: 'track' }
     * @returns {Promise<Object>} - Returns a Promise that resolves with the search results.
     */
    async search({ query: query, type: type }) {
        try {
            if (!query || typeof query !== "string") {
                throw new Error("Error | Please provide a search query");
            }

            if (!type) {
                return await this.searchTrack(query);
            }
            if (type && typeof type !== "string") {
                throw new Error(
                    "Error | Please Provide a valid search type eg: track, album, artist, playlist"
                );
            }
            const tezz = type.toLowerCase();
            if (tezz === "track" || tezz === "song" || tezz === "music track") {
                return await this.searchTrack(query);
            }
            if (tezz === "album" || tezz === "music album") {
                return await this.searchAlbum(query);
            }
            if (tezz === "artist" || tezz === "singer") {
                return await this.searchArtist(query);
            }
            if (
                tezz === "playlist" ||
                tezz === "music playlist" ||
                tezz === "songs playlist"
            ) {
                return await this.searchPlaylist(query);
            }
            throw new Error(
                "Error | Invalid search type, Please provide a valid search type, eg: track, album, artist, playlist"
            );
        } catch (error) {
            throw new Error(error.message);
        }
    }
    /**
     * @params {string} trackName - The track name to search on Spotify
     * @returns {object} - Returns the track information
     * @returns {string} title - The title of the track
     * @returns {string} artist - The artist of the track
     * @returns {string} thumbnail - The thumbnail of the track
     * @returns {string} link - The link of the track
     * @returns {string} artistLink - The link of the artist
     * @returns {string} album - The album of the track
     * @returns {string} duration - The duration of the track
     * @returns {object} rawData - The raw data of the track
     **/
    async searchTrack(trackName) {
        try {
            if (!trackName || typeof trackName !== "string") {
                throw new Error("Error | Please provide a track name to search on Spotify");
            }
            if (this.cacheEnabled) {
                const cachedData = cache.get(`spotify_track_${trackName}`);
                if (cachedData) {
                    return cachedData;
                }
            }
            const accessToken = await this.getSpotifyToken();
            const searchResponse = await axios.get(
                "https://api.spotify.com/v1/search",
                {
                    params: {
                        q: trackName,
                        type: "track",
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const firstTrack = searchResponse.data?.tracks?.items[0];
            if (firstTrack) {
                let artists = ``;
                let sia = firstTrack.artists[0].name.replace(/,/g, "");
                if (firstTrack.artists.length === 1) {
                    artists = sia;
                }
                if (firstTrack.artists.length === 2) {
                    artists = `${firstTrack.artists[0].name} and ${firstTrack.artists[1].name.replace(/,/g, "")}`;
                }
                if (firstTrack.artists.length > 2) {
                    artists = `${firstTrack.artists[0].name}, ${firstTrack.artists[1].name} and ${ firstTrack.artists.length - 2} more`;
                }
                const trackInfo = {
                    title: firstTrack.name ? firstTrack.name : "Unknown Track",
                    artist: artists ? artists : "Unknown Artist",
                    thumbnail: firstTrack.album.images[0].url
                        ? firstTrack.album.images[0].url
                        : null,
                    link: firstTrack.external_urls.spotify
                        ? firstTrack.external_urls.spotify
                        : "Unknown Track Link",
                    artistLink: firstTrack.artists[0].external_urls.spotify
                        ? firstTrack.artists[0].external_urls.spotify
                        : "Unknown Artist URL",
                    artistsLinks: firstTrack.artists.map(
                        (artist) => artist.external_urls.spotify
                    ),
                    album: firstTrack.album.name
                        ? firstTrack.album.name
                        : "Unknown Album",
                    duration: this.tejas(firstTrack.duration_ms)
                        ? this.tejas(firstTrack.duration_ms)
                        : "Unknown Duration",
                    durationInMs: firstTrack.duration_ms
                        ? firstTrack.duration_ms
                        : "Unknown Duration",
                    rawData: firstTrack ? firstTrack : null,
                };
                if (this.cacheEnabled) {
                    cache.set(`spotify_track_${trackName}`, trackInfo);
                }
                return trackInfo;
            }
            const trackInfo = {
                title: "Track Not Found",
                artist: "Unknown Artist",
                thumbnail: null,
                link: "Unknown Track Link",
                artistLink: "Unknown Artist URL",
                album: "Unknown Album",
                duration: "Unknown Duration",
                durationInMs: "Unknown Duration",
                rawData: null,
            };
            return trackInfo;
        } catch (error) {
            if (error.response) {
                throw new Error(
                    `Error | Searching for track by name on Spotify: ${error.response.data.error.message}`
                );
            } else if (error.request) {
                throw new Error("Error | While Making request to Spotify API");
            } else if (error.message) {
                throw new Error(error.message);
            } else {
                throw new Error(
                    "Error | Something went wrong while searching for track by name on Spotify"
                );
            }
        }
    }
    /**
     * @params {string} albumName - The album name to search on Spotify
     * @returns {object} - Returns the album information
     */
    async searchAlbum(albumName) {
        try {
            if (!albumName || typeof albumName !== "string") {
                throw new Error("Error | Please provide an album name to search on Spotify");
            }
            if (this.cacheEnabled) {
                const cachedData = cache.get(`spotify_album_${albumName}`);
                if (cachedData) {
                    return cachedData;
                }
            }
            const accessToken = await this.getSpotifyToken();
            const searchResponse = await axios.get(
                "https://api.spotify.com/v1/search",
                {
                    params: {
                        q: albumName,
                        type: "album",
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const firstAlbum = searchResponse.data?.albums?.items[0];
            if (firstAlbum) {
                const albumInfo = {
                    title: firstAlbum.name ? firstAlbum.name : "Unknown Album",
                    artist: firstAlbum.artists[0].name
                        ? firstAlbum.artists[0].name
                        : "Unknown Artist",
                    thumbnail: firstAlbum.images[0].url ? firstAlbum.images[0].url : null,
                    link: firstAlbum.external_urls.spotify
                        ? firstAlbum.external_urls.spotify
                        : "Unknown Album Link",
                    artistLink: firstAlbum.artists[0].external_urls.spotify
                        ? firstAlbum.artists[0].external_urls.spotify
                        : "Unknown Artist URL",
                    rawData: firstAlbum ? firstAlbum : null,
                };
                if (this.cacheEnabled) {
                    cache.set(`spotify_album_${albumName}`, albumInfo);
                }
            }
            const albumInfo = {
                title: "Album Not Found",
                artist: "Unknown Artist",
                thumbnail: null,
                link: "Unknown Album Link",
                artistLink: "Unknown Artist URL",
                rawData: null,
            };
            return albumInfo;
        } catch (error) {
            if (error.response) {
                throw new Error(
                    `Error | Searching for album by name on Spotify: ${error.response.data.error.message}`
                );
            } else if (error.request) {
                throw new Error("Error | While Making request to Spotify API");
            } else if (error.message) {
                throw new Error(error.message);
            } else {
                throw new Error(
                    "Error | Something went wrong while searching for album by name on Spotify"
                );
            }
        }
    }
    /**
     * @params {string} artistName - The artist name to search on Spotify
     * @returns {object} - Returns the artist information
     */
    async searchArtist(artistName) {
        try {
            if (!artistName || typeof artistName !== "string") {
                throw new Error("Error | Please provide an artist name to search on Spotify");
            }
            if (this.cacheEnabled) {
                const cachedData = cache.get(`spotify_artist_${artistName}`);
                if (cachedData) {
                    return cachedData;
                }
            }
            const accessToken = await this.getSpotifyToken();
            const searchResponse = await axios.get(
                "https://api.spotify.com/v1/search",
                {
                    params: {
                        q: artistName,
                        type: "artist",
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const firstArtist = searchResponse.data?.artists?.items[0];
            if (firstArtist) {
                const artistInfo = {
                    name: firstArtist.name ? firstArtist.name : "Unknown Artist",
                    thumbnail: firstArtist.images[0].url
                        ? firstArtist.images[0].url
                        : null,
                    link: firstArtist.external_urls.spotify
                        ? firstArtist.external_urls.spotify
                        : "Unknown Artist Link",
                    followers: firstArtist.followers.total
                        ? firstArtist.followers.total
                        : "Followers Count Not Available",
                    rawData: firstArtist ? firstArtist : null,
                };
                if (this.cacheEnabled) {
                    cache.set(`spotify_artist_${artistName}`, artistInfo);
                }
                return artistInfo;
            }
            const artistInfo = {
                name: "Artist Not Found",
                thumbnail: null,
                link: "Unknown Artist Link",
                followers: "Followers Count Not Available",
                rawData: null,
            };
            return artistInfo;
        } catch (error) {
            if (error.response) {
                throw new Error(
                    `Error | Searching for artist by name on Spotify: ${error.response.data.error.message}`
                );
            } else if (error.request) {
                throw new Error("Error | While Making request to Spotify API");
            } else if (error.message) {
                throw new Error(error.message);
            } else {
                throw new Error(
                    "Error | Something went wrong while searching for artist by name on Spotify"
                );
            }
        }
    }
    /**
     * @params {string} playlistName - The playlist name to search on Spotify
     * @returns {object} - Returns the playlist information
     */
    async searchPlaylist(playlistName) {
        try {
            if (!playlistName || typeof playlistName !== "string") {
                throw new Error("Error | Please provide a playlist name to search on Spotify");
            }
            if (this.cacheEnabled) {
                const cachedData = cache.get(`spotify_playlist_${playlistName}`);
                if (cachedData) {
                    return cachedData;
                }
            }
            const accessToken = await this.getSpotifyToken();
            const searchResponse = await axios.get(
                "https://api.spotify.com/v1/search",
                {
                    params: {
                        q: playlistName,
                        type: "playlist",
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const firstPlaylist = searchResponse.data?.playlists?.items[0];
            if (firstPlaylist) {
                const playlistInfo = {
                    title: firstPlaylist.name ? firstPlaylist.name : "Unknown Playlist",
                    description: firstPlaylist.description
                        ? firstPlaylist.description
                        : "No Description Available",
                    playlistOwner: firstPlaylist.owner.display_name
                        ? firstPlaylist.owner.display_name
                        : "Unknown Owner",
                    totalTracks: firstPlaylist.tracks.total
                        ? firstPlaylist.tracks.total
                        : "Unknown Total Tracks",
                    thumbnail: firstPlaylist.images[0].url
                        ? firstPlaylist.images[0].url
                        : null,
                    link: firstPlaylist.external_urls.spotify
                        ? firstPlaylist.external_urls.spotify
                        : "Unknown Playlist Link",
                    rawData: firstPlaylist ? firstPlaylist : null,
                };
                if (this.cacheEnabled) {
                    cache.set(`spotify_playlist_${playlistName}`, playlistInfo);
                }
                return playlistInfo;
            }
            const playlistInfo = {
                title: "Playlist Not Found",
                description: "No Description Available",
                playlistOwner: "Unknown Owner",
                totalTracks: "Unknown Total Tracks",
                thumbnail: null,
                link: "Unknown Playlist Link",
                rawData: null,
            };
            return playlistInfo;
        } catch (error) {
            if (error.response) {
                throw new Error(
                    `Error | Searching for playlist by name on Spotify: ${error.response.data.error.message}`
                );
            } else if (error.request) {
                throw new Error("Error | While Making request to Spotify API");
            } else if (error.message) {
                throw new Error(error.message);
            } else {
                throw new Error(
                    "Error | Something went wrong while searching for playlist by name on Spotify"
                );
            }
        }
    }
    /**
     * @params {string} previousTrackUrl - The track URL to get recommendations from Spotify based on the previous track
     * @returns {string} - Returns the recommended track URL
     */

    async getRecommendations(previousTrackUrl) {
        try {
            const baseApiUrl = "https://api.spotify.com/v1/recommendations";
            const accessToken = await this.getSpotifyToken();
            if (!previousTrackUrl.includes("open.spotify.com")) {
                throw new Error(
                    "Error | Invalid Spotify Track URL , Please provide a valid Spotify Track URL"
                );
            }
            if (!previousTrackUrl.includes("/track/")) {
                throw new Error(
                    "Error | Invalid Spotify Track URL , Please provide a valid Spotify Track URL"
                );
            }
            if (!previousTrackUrl.includes("https://open.spotify.com/track/")) {
                throw new Error(
                    "Error | Invalid Spotify Track URL , Please provide a valid Spotify Track URL"
                );
            }
            const id = this.tezzop(previousTrackUrl);
            const response = await axios.get(baseApiUrl, {
                params: {
                    seed_tracks: id,
                    limit: 1,
                    market: "IN",
                },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data.tracks[0].external_urls.spotify;
        } catch (error) {
            if (error.response) {
                throw new Error(
                    `Error | Getting Recommendations from Spotify: ${error.response.data.error.message}`
                );
            } else if (error.request) {
                throw new Error("Error | While Making request to Spotify API");
            } else if (error.message) {
                throw new Error(error.message);
            } else {
                throw new Error(
                    "Error | Something went wrong while getting recommendations from Spotify"
                );
            }
        }
    }
    tezzop(previousTrackUrl) {
        return previousTrackUrl.split("/").pop();
    }
    async getSpotifyToken() {
        if (this.tezzTokenCache && this.tezzTokenCacheExpiration > Date.now()) {
            return this.tezzTokenCache;
        }
        try {
            const response = await axios.post(
                "https://accounts.spotify.com/api/token",
                "grant_type=client_credentials",
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: `Basic ${Buffer.from(
                            `${this.clientId}:${this.clientSecret}`
                        ).toString("base64")}`,
                    },
                }
            );
            if (!response.data.access_token) {
                throw new Error("Error | While getting Spotify Access Token");
            }
            if (this.cache) {
                this.cache.set("spotify_token", response.data.access_token, response.data.expires_in - 60);
            }
            this.tezzTokenCache = response.data.access_token;
            this.tezzTokenCacheExpiration =
                Date.now() + (response.data.expires_in - 60) * 1000;
            return this.tezzTokenCache;
        } catch (error) {
            throw new Error("Error | While getting Spotify Access Token");
        }
    }
    getRandomCache() {
        const prefix = "spoti_pro";
        const sufix = "tezz";
        const Alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        let randomKey = "";
        for (let i = 0; i < 5; i++) {
            randomKey += Alphabets.charAt(
                Math.floor(Math.random() * Alphabets.length)
            );
        }
        for (let i = 0; i < 5; i++) {
            randomKey += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        return `${prefix}_${randomKey}_${sufix}`;
    }

    tejas(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) {
            return `${days} days ${hours % 24} hours ${minutes % 60} minutes ${seconds % 60
                } seconds`;
        }
        if (hours > 0) {
            return `${hours} hours ${minutes % 60} mins ${seconds % 60} secs`;
        }
        if (minutes > 0) {
            return `${minutes} mins ${seconds % 60} secs`;
        }
        return `${seconds} seconds`;
    }
};
