Example apps for the new Rdio JavaScript API ([currently in beta](https://groups.google.com/forum/?hl=en&fromgroups=#!topic/rdio-api/_UlW2Oc6Dvc)).

## Basics

* Simple Player: Best place to start.
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
