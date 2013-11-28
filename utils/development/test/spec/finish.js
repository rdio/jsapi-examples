(function() {

  // ----------
  describe('rdioUtils.finish', function() {

    // ----------
    it('puts its toys away', function() {
      var done = false;

      setTimeout(function() {
        R.player.pause();  
        done = true;      
      }, 1000);

      waitsFor(function() {
        return done;
      }, 2000);
    });

  });

})();
