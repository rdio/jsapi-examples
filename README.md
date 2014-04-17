# Rdio JS API Examples

Example apps for the new Rdio JavaScript API ([currently in beta](https://groups.google.com/forum/?hl=en&fromgroups=#!topic/rdio-api/_UlW2Oc6Dvc)).

To use these examples, `git clone` this repository or [download it as a zip](https://github.com/rdio/jsapi-examples/archive/master.zip). To run them, you'll need to start a local server. If you're not sure how to do that, see [these instructions](https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally#run-local-server).

For each example you use, you'll also need to create an Rdio JS API client ID (not to be confused with a Mashery app key), and replace the `client_id` in that example's Rdio API script tag (in the index.html). To create a client ID, go to the [Create App](http://www.rdio.com/developers/create/) page once you have been added to the beta (the page is not visible otherwise).

## Basics

* Basic Starter: Best place to start.
* Simple Player: Simple playback and searching.
* Now Playing: For using the `shared_playstate` permission.
* Following: For using `R.currentUser.trackFollowing()`.

## More Advanced

* Music Triage: Collect or reject the music you've listened to.
* Tag View: View your collection by Last.fm tag.
* Collection Browse: Mobile-optimized collection viewer.
* Playlist Albums: View your playlists by album rather than track.
* Mobile Queue: Manage your queue via your mobile browser.

## Utils

A set of utilities to help you work with the Rdio JavaScript API. See https://github.com/rdio/jsapi-examples/blob/master/utils/README.md for more info.

* Collection Random: Shuffle your collection and add albums to your queue. Uses `rdioUtils.collectionAlbums()` and `rdioUtils.albumWidget()`.
