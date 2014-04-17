# Mobile Queue

Allows you to manipulate your queue on mobile.

http://iangilman.com/rdio/mobile-queue/

Note that this app requires the "shared_playstate" permission, which you can ask for when you create your own app.

For information on using this example, see https://github.com/rdio/jsapi-examples#rdio-js-api-examples.

# To Do (possible future additions to this example)

* Should resets be paused while menu is up? Or maybe another way to deal with state changing?
* Optimize for next album... pop top item off of queue right away?
* Determine item from key, not just index
* Hold off on sending move if there's a reset in progress
* If updates are coming in from elsewhere, hold off on determining drag indices
* If you're on a device that requires the "audio prime" sequence and the user cancels, things get messed up
* Highlight menu items when you touch them
* Sometimes there's a flash of the old playing album when you switch to a new one with "Play Now"
* Don't allow a second drag while one is in progress
* Show album in menu for context?
* Clean up code so it's a proper example
* Should animate into position when you drop
* Test adding items in the middle to make sure we're doing the right thing
* Indicator that things are updating
* Item is jittery when scrolling during drag
* Variable scroll speed depending on where you are
* Do all animations with transform instead of top?
* Search for new stuff to add
* Possible to bring in items from other apps?
