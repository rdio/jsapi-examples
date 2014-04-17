# Music Triage

This web-app is an example usage of the new Rdio JavaScript API. You can see it in action at http://music-triage.appspot.com/

I like to queue up a bunch of new music and listen to it throughout the day. Every day or two I go back through my history and add the albums I liked to my collection. This web app is tailored to that history triage. Albums you've listened to but haven't triaged show up in the middle. Hit the heart on an album to add that album to your collection; hit the X to discard it.

Note that the "dustbin" status of an album is stored only in your browser's local storage. Perhaps in the future we'll add a server-side component for more robust storage.

# Running

For information on using this example, see https://github.com/rdio/jsapi-examples#rdio-js-api-examples.

This project was started with [Google App Engine](https://developers.google.com/appengine/) in mind, but you can actually run it in a regular web server as well. 

# To Do (possible future additions to this example)

## High Priority

* Show track listing on hover
* Checkbox to auto-hide singles and remix albums
* Album and artist name
* Show track count (when album is shown big)
* Save dustbin to server. See: https://github.com/dasevilla/rdiocli/blob/master/rdiocli/oauth2/bearer.py
* If you've removed an album from your collection, remove it from the local storage cache too
* Only show albums that support full streaming.

## Normal Priority

* If an album is playing when you hit heart/x, start the next album playing
* Each click on sample button should take you to 1/3rd through the next track (on playingTrack change, seek to its duration / 3)
* Indicate that there's nothing left to triage when you're all done
* Key combos
* The first time you hit play there's a bit of a lag before the button highlights
* Shadows behind buttons

## Low Priority

* Spinner for buffering
* Periodically check for newly played albums
* Only load as much collection as needed (remember where you left off)
* Third option: add back to the queue for another listen
* Use normal Rdio album controls, but add some of our own
* Sort high if other albums from same artist in collection; low if not and others in dustbin

## Wishlist

* Triage for new releases (heart goes into queue instead of collection)
* Triage related, based on an artist/album
* Triage albums from activity in your network
* Triage new albums from artists in your collection
