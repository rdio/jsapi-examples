(function() {

  var trackKey = 't40267992';
  var trackKey2 = 't40268027';
  var trackKey3 = 't40268071';

  // ----------
  describe('rdioUtils.localQueue', function() {

    // ----------
    it('does all the things', function() {
      var addCount = 0;
      var removeCount = 0;
      var startCount = 0;
      var stopCount = 0;
      var playCount = 0;

      var queue = rdioUtils.localQueue({
        onStart: function() {
          startCount++;
        },
        onStop: function() {
          stopCount++;
        },
        onPlay: function(source) {
          playCount++;
        },
        onAdd: function(source, index) {
          addCount++;
        },
        onRemove: function(source, index) {
          removeCount++;
        }
      });

      expect(queue).toBeDefined();
      queue.add(trackKey);
      queue.add(trackKey2);
      queue.add(trackKey3, 1);
      expect(queue.length).toBe(3);
      var source = queue.at(1);
      expect(source).toBeDefined();
      expect(source.key).toBe(trackKey3);
      queue.remove(source);
      expect(queue.length).toBe(2);
      queue.play();

      waitsFor(function() {
        return playCount === 1;
      }, 9000, 'the first track to play');

      runs(function() {
        expect(queue.length).toBe(1);
        expect(queue.playing()).toBe(true);
        queue.next();
      });
 
      waitsFor(function() {
        return playCount === 2;
      }, 9000, 'the second track to play');

      runs(function() {
        queue.stop();  
        expect(queue.playing()).toBe(false);
        expect(queue.length).toBe(0);  
        expect(startCount).toBe(1);
        expect(playCount).toBe(2);
        expect(addCount).toBe(3);
        expect(removeCount).toBe(3);
        expect(stopCount).toBe(1);
      });
    });

  });

})();
