(function() {

  var albumKey = 'a171827'; // Radiohead, The Bends
  var albumKey2 = 'a216556'; // The Black Keys, Brothers
  var trackKey = 't40267992';

  // ----------
  describe('rdioUtils.general', function() {

    // ----------
    it('performs startup checks', function() {
      var ready = false;

      expect(rdioUtils.startupChecks()).toBe(true);

      R.ready(function() {
        ready = true;
      });

      waitsFor(function() {
        return ready;
      }, 9000);
    });

    // ----------
    it('can add to top of queue', function() {
      R.player.play({ source: trackKey });
      R.player.queue.clear();
      R.player.queue.add(albumKey2);

      R.ready(function() {
        rdioUtils.addToTopOfQueue(albumKey);
      });
      
      waitsFor(function() {
        var source = R.player.queue.at(0);
        if (source) {
          return source.get('key') === albumKey;
        }

        return false;
      }, 9000);
    });
  });

})();
