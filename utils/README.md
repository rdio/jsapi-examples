# Rdio Utils

Some helper functions for the Rdio JavaScript API. 

## Documentation

To use, include `rdio-utils.min.js` and `rdio-utils.css` in your project. It adds a single object to the global space: `rdioUtils`.  See below for methods.

### rdioUtils.startupChecks()

Does various standard health checks, and notifies the user if there are issues. The notification is a simple dialog that you can style via the `.rdio-utils-dialog` CSS class. It's not terribly deluxe, so if you want something more advanced, you might just use the code as a reference for what to check.

It checks:

* If the Rdio API loaded at all.
* If the user has cookies blocked.
* If the user needs Flash but has it blocked or not installed.

It returns `true` if the API exists on the page and false if it doesn't (i.e. Rdio is down).

```
if (!rdioUtils.startupChecks()) {
  return;
}
``` 

### rdioUtils.collectionAlbums( config )

Allows you to access all the albums in the user's collection, and notifies you when albums are added or removed.

The first time it's run (or every time if you don't use the `localStorage` option), it loads all the albums from the user's collection out of the Rdio database. This may take as long as a minute for large collections. Thereafter (assuming you're using the `localStorage` option), it'll load immediately.

When the user adds or removes albums from their collection, you'll be notified shortly thereafter. If they've added or removed albums since you last ran, you'll be notified of those right after the initial load.

```
var collection = rdioUtils.collectionAlbums({
  localStorage: true, // Highly recommended.
  onAlbumsLoaded: function(albums) {
    // Called during the initial load with an array of albums. When loading
    // from the Rdio database, you'll get a number of these; when loading
    // from localStorage, it'll come in one bunch.
  },
  onLoadComplete: function() {
    // Called when the initial load is complete.
  },
  onError: function(message) {
    // Called with any loading errors.
  },
  onAdded: function(albums) {
    // Called after the initial load when the user adds additional albums to 
    // their collection.
  },
  onRemoved: function(albums) {
    // Called after the initial load when the user removes albums from their 
    // collection.
  }
});
```

Each album in the collection object is a plain JavaScript object with these properties:

* artist
* artistKey
* artistUrl
* canSample
* canStream
* duration
* icon
* isClean
* isExplicit
* key
* length
* name
* releaseDate
* trackKeys
* url

The collection object itself has these methods:

* at( index ): Returns the album at the given index.
* each( iterator( album, index ) ): Calls the iterator function once per album in the collection, passing the album and index.

... and this property:

* length: The number of sources in the collection.

You can see an example of this feature in action here: http://iangilman.com/rdio/utils/examples/collection/

### rdioUtils.authWidget( element )

Turns the given element into a small Rdio authentication widget: if the user is authenticated, it shows their name. Otherwise it shows a "Sign In With Rdio" button which, when clicked, initiates the authentication sequence. If the authentication is successfull, the widget updates to show the user's name.

`element` can be either a DOM element or a jQuery object. Its contents will be replaced with the widget.

```
rdioUtils.authWidget($('.authenticate'));
```

### rdioUtils.albumWidget( album )

Given an `album` object that you might receive from `R.request()` calls or from `rdioUtils.collectionAlbums()`, gives you a standard Rdio album UI widget.

Returns an AlbumWidget object which contains an element you can attach to the DOM. The AlbumWidget has these methods:

* element(): returns the DOM element.
* broken(): returns true if the album you provided did not have sufficient information.

The `album` you pass in must have these properties:

* artist
* artistUrl
* icon
* key
* name
* url

...and will optionally use:

* length

Note that the widget doesn't have the standard "Share" and "Action" buttons yet... we'll be adding those in if and when the JavaScript API supports their functionality.

You can see an example of this feature in action here: http://iangilman.com/rdio/utils/examples/album-widget/

### rdioUtils.addToTopOfQueue( sourceKey )

Adds the given source to the top of the queue (rather than the bottom, which is where `R.player.queue.add()` puts it).

```
rdioUtils.addToTopOfQueue('a3032151'); // Alice In Chains - The Devil Put Dinosaurs Here
```

### rdioUtils.localQueue( config )

When using the shared_playstate permission, your app may want to maintain a queue of things it's going to play without disrupting the user's Rdio queue. This method return a LocalQueue object that allows you to do that. 

Fill it up with the keys for sources you want to play using `add(sourceKey)` and then tell it `play()`. Once it's playing, it's in charge of playback, feeding Rdio each new source as the last one ends. If you want to stop your queue and let Rdio go back to playing what's in the user's Rdio queue, use `stop()`.

Once added to the LocalQueue, the sourceKey is stored in an object hereafter referred to as a `source`. Sources have a single property, `key`, but the source objects themselves are unique, unlike keys which can appear multiple times in the same LocalQueue. This allows you to easily keep track of each source in the queue, even if your queue has multiple copies of the same track or album.

Note that in order for the LocalQueue to work properly, your app needs to have "master" status (i.e. the one actually playing the music). The LocalQueue takes care of this automatically.

```
var queue = rdioUtils.localQueue({
  onStart: function() {
    // Called when the LocalQueue starts playing.
  },
  onStop: function() {
    // Called when the LocalQueue stops playing.
  },
  onPlay: function(source) {
    // Called when the LocalQueue starts playing a new source.
  },
  onAdd: function(source, index) {
    // Called when a source is added to the LocalQueue.
  },
  onRemove: function(source, index) {
    // Called when a source is removed from the LocalQueue.
  }  
});
```

The LocalQueue has these methods:

* add( sourceKey, [ index ] ): Adds the given sourceKey to the LocalQueue at the given index (or at the end if no index is provided).
* at( index ): Returns the source at the given index.
* clear(): Removes all sources from the LocalQueue.
* each( iterator( source, index ) ): Calls the iterator function once per item in the LocalQueue, passing the source and index.
* next(): Plays the next source in the LocalQueue.
* play( [ indexOrSource ] ): Puts the LocalQueue in charge of playback, starting at the given index or source (or the front of the queue if none specified).
* playing(): Returns true if the LocalQueue is in charge of playback.
* remove( [ indexOrSource ] ): Removes the source specified, or the first item if none specified.
* stop(): The LocalQueue relinquishes control of playback, returning it to the Rdio queue.

... and this property:

* length: The number of sources in the LocalQueue.

You can see an example of this feature in action here: http://iangilman.com/rdio/utils/examples/local-queue/
