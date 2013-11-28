# Rdio Utils Development

If you want to use Rdio Utils in your own projects, you can find the latest stable build in the folder above. If you want to modify Rdio Utils and/or contribute to its development, read on.

## First Time Setup

All command-line operations for building Rdio Utils are scripted using [Grunt](http://gruntjs.com/) which is based on [Node.js](http://nodejs.org/). To get set up:

1. Install Node, if you haven't already (available at the link above)
1. Install the Grunt command line runner (if you haven't already); on the command line, run `npm install -g grunt-cli`
1. In this folder, run `npm install`

You're set... continue reading for build and test instructions.

## Building from Source

To build, just run (on the command line, in this folder):

    grunt build

If you want Grunt to watch your source files and rebuild every time you change one, use:

    grunt watch

The built files appear in the `build` folder.

Note that the `build` folder is masked with .gitignore; it's just for your local use, and won't be checked in to the repository.

You can also publish the built version to the folder above (where the stable builds live). The command is:

    grunt publish

## Testing

We're using Jasmine. The test specs are located in the test/spec folder. To run the tests, use:

    grunt test

## TO DO:

* Playback UI
* Album UI
* Unit tests for collectionAlbums()
 * Interrupting a load with another load
 * If library changes during initial load
* Track the collection of any user?
* Sort collectionAlbums by play count, date added, etc?
* More UI widgets: responsive grids and track listings

### Auth Widget

* onAuth callback for convenience
* test?

### Album Widget

* Accept Backbone-style album, straight object, or key
* If you have to load, coalesce multiple keys into a single call if possible
* Retina support
* Collection badge (use collection tracker); make it optional
* Explicit/clean tags
* "Unavailable" and "preview"
* Wishlist: social heat
* Responsive
* Share
* Action Menu

### Collection Tracker

* Devin wants "extras" for album collection (so you can retrieve specific info)
* Only one per session; multiple calls just get the same one

### Local Queue

* Support multiple queues per page
* More bulletproof
 * Should we be able to cancel things in flight for forceMaster? For instance, what if you're not master and you fire off a play and a stop in rapid succession; the play will arrive after the stop.
 * Double check the values we get from the API
