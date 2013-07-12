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

## TO DO:

* Tests
* "extras" for album collection (so you can retrieve specific info)
* Playback UI
* Album UI
* Unit tests for collectionAlbums()
 * Interrupting a load with another load
 * If library changes during initial load
* Track the collection of any user?
* Sort collectionAlbums by play count, date added, etc?

### Album Widget

* Accept Backbone-style album, straight object, or key
* If you have to load, coalesce multiple keys into a single call if possible
