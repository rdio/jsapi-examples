(function() {

  var album = {
    artist: 'Drake',
    artistUrl: '/artist/Drake/',
    icon: 'http://rdio-b.cdn3.rdio.com/album/7/5/5/000000000034a557/4/square-200.jpg',
    key: 'a3450199',
    length: 15,
    name: 'Nothing Was The Same (Deluxe)',
    url: '/artist/Drake/album/Nothing_Was_The_Same_(Deluxe)_3/'
  };

  var clone = function(obj) {
    return $.extend({}, obj);
  };

  // ----------
  describe('rdioUtils.albumWidget', function() {

    // ----------
    it('creates a widget', function() {
      var widget = rdioUtils.albumWidget(clone(album));
      expect(widget.broken()).toBe(false);
      expect(widget.element()).toBeDefined();
      expect($(widget.element()).text()).toMatch(/Drake/);
      expect($(widget.element()).text()).toMatch(/Nothing/);
    });

    // ----------
    it('gives errors without enough data', function() {
      var album2 = clone(album);
      delete album2.name;
      delete album2.key;

      var errors = 0;
      spyOn(console, 'error').andCallFake(function() {
        errors++;
      });
      
      var widget = rdioUtils.albumWidget(album2);
      expect(errors).toBe(2);
      expect(widget.broken()).toBe(true);
      expect(widget.element()).toBeDefined();
      expect($(widget.element()).text()).toMatch(/Unknown/);
      expect($(widget.element()).text()).not.toMatch(/Drake/);
    });
  });

})();
