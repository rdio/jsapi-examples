/*globals Main, R, Backbone */

(function() {

  // ==========
  Main.Views.Pictures = function() {
    var self = this;
    this.$el = $('#content');
    this.$artist = this.$el.find('.artist');
    this.$picture = this.$el.find('.picture').eq(0)
      .css({
        'z-index': 10
      });
      
    this.artist = null;
    this.albumCover = '';
    this.images = [];
    this.lastfmImages = [];
    this.pictureTimeout = null;

    this.checkArtist();
    R.player.on('change:playingTrack', this.checkArtist, this);
    
    this.changePicture();
  };
  
  Main.Views.Pictures.prototype = {
    // ----------
    checkArtist: function() {
      var artist = '';
      var albumCover = '';
      var track = R.player.playingTrack();
      if (track) {
        artist = track.get('artist') || '';
        albumCover = track.get('icon').replace('200.jpg', '1200.jpg');
      }
      
      if (artist === this.artist) {
        return;
      }
      
      this.artist = artist;
      this.albumCover = albumCover;
      this.$artist.text(this.artist || 'None');
      this.images = [];
      if (this.albumCover) {
        this.images.push(this.albumCover);
      }
      
      this.loadPictures(this.artist);
    },
    
    // ----------
    loadPictures: function(artist) {
      var self = this;
      this.lastfmImages = [];
      
      if (!artist) {
        return;
      }
      
      var url = 'http://ws.audioscrobbler.com/2.0/?method=artist.getimages&artist='
        + encodeURIComponent(artist)
        + '&limit=200&api_key='
        + Main.lastfmKey
        + '&format=json&callback=?';
          
      $.getJSON(url, function (data) {
        if (!data || !data.images || !data.images.image) {
          return;
        }
        
        _.each(data.images.image, function(v, i) {
          if (!v || !v.sizes || !v.sizes.size || !v.sizes.size[0]) {
            return;
          }
          
          var url = v.sizes.size[0]['#text'];
          if (url) {
            self.lastfmImages.push(url);
          }
        });
        
        self.changePicture();
      });      
    },

    // ----------
    changePicture: function() {
      var self = this;
      
      if (self.pictureTimeout) {
        clearTimeout(self.pictureTimeout);
        self.pictureTimeout = null;
      }

      var url = this.images.shift();
      if (!url) {
        this.images = _.shuffle(this.lastfmImages);
        url = this.images.shift();
        if (!url) {
          return;
        }
      }
      
      $('<img>')
        .load(function() {
          self.$picture.css({
            'background-image': 'url("' + url + '")'
          });

          self.pictureTimeout = setTimeout(_.bind(self.changePicture, self), 3000);
        })
        .error(function() {
          self.changePicture();
        })
        .attr('src', url);
    }
  };

})();
