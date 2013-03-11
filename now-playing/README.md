# About

This app displays pictures of the artist for the currently playing album.

http://iangilman.com/rdio/now-playing/

Note that this app requires the "shared_playstate" permission, which you can ask for when you create your own app.

Add `?pics=false` to the URL to just show the cover.

# TODO

## High

## Normal

* Update "add to collection" button for albums that are in your collection
* If there are more than the first set of images, keep loading
* Show play/pause status
* Load two images at a time to deal with slow ones? Or have a timeout? Or load the next one right after the swap? 

## Low

* If the window resizes, re-evaluate image sizes
* On a small enough window (like on a phone) look for a small image and not necessarily just "original"
* IE 8 support
