/*globals R, Main */

(function() {

  window.Music = {
    playingAlbum: null, 
    gracePeriod: 0,
    
    init: function() {
      var self = this;
  
      R.player.on("change:playingSource", function(v) {
        self.setPlayingAlbum(self.isPlaying() ? v.get("key") : null);
      });
  
      R.player.on("change:playState", function(v) {
        var key = null;
        if (self.isPlaying()) {
          var playingSource = R.player.playingSource();
          if (playingSource) {
            key = playingSource.get("key");
          }
        }
        
        self.setPlayingAlbum(key);
      });
    },
    
    toggle: function(album) {
      var playingSource = R.player.playingSource();
      if (playingSource && playingSource.get("key") == album.key) {
        this.gracePeriod = 0;
        R.player.togglePause();
      } else {
        this.gracePeriod = $.now() + 1000;
        this.setPlayingAlbum(album.key);
        R.player.play({source: album.key});
      }
    },
    
    stop: function(album) {
      var playingSource = R.player.playingSource();
      if (playingSource && playingSource.get("key") == album.key
          && R.player.playState() == 1) {
        this.gracePeriod = 0;
        R.player.togglePause();
      }
    }, 
    
    isPlaying: function() {
      var playState = R.player.playState();
      return (playState == 1 || playState == 2 || $.now() < this.gracePeriod);
    },
    
    setPlayingAlbum: function(key) {
      if (this.playingAlbum && this.playingAlbum.key == key) {
        return;
      }
  
      if (this.playingAlbum) {
        this.playingAlbum.updatePlaying(0);
      }
      
      this.playingAlbum = (key ? Main.album(key) : null);
      
      if (this.playingAlbum) {
        var playState = R.player.playState();
        this.playingAlbum.updatePlaying(playState == 1 ? 1 : 2);
      }
    }    
  };

})();
  