/*globals Main, R, Backbone */

(function() {

  // ==========
  Main.Views.Pictures = function() {
    var self = this;
    this.$el = $('#content');
    this.$artist = this.$el.find('.artist');
    this.$album = this.$el.find('.album');
    this.$track = this.$el.find('.track');
    this.$currentPicture = this.$el.find('.picture').eq(0)
      .css({
        'z-index': 10
      });

    this.$nextPicture = this.$el.find('.picture').eq(1)
      .css({
        'z-index': 1
      });
      
    this.artist = null;
    this.albumCover = '';
    this.images = [];
    this.lastfmImages = [];
    this.pictureTimeout = null;
    this.currentImageUrl = '';
    this.$loadingImage = null;
    this.slideSpeed = 6000;
    this.fadeSpeed = 2000; // Needs to be the same as the transition speed for .picture in the css
    this.showPictures = (location.search.search(/pics=false/i) == -1);

    this.checkArtist();
    R.player.on('change:playingTrack', this.checkArtist, this);
    
    this.changePicture();
  };
  
  Main.Views.Pictures.prototype = {
    // ----------
    checkArtist: function() {
      var artist = '';
      var album = '';
      var trackName = '';
      var albumCover = '';
      var artistChanged = false;
      var albumChanged = false;

      var track = R.player.playingTrack();
      if (track) {
        artist = track.get('artist') || '';
        album = track.get('album') || '';
        trackName = track.get('name') || '';
        albumCover = track.get('icon').replace('200.jpg', '1200.jpg');
      }
      
      this.$album.text(album);
      this.$track.text(trackName);

      if (albumCover !== this.albumCover) {
        this.albumCover = albumCover;
        albumChanged = true;
      }

      if (artist !== this.artist) {
        this.artist = artist;
        this.$artist.text(this.artist || 'None');
        artistChanged = true;
      }

      if (artistChanged || albumChanged) {
        if (artistChanged || !this.showPictures) {
          this.images = [];        
        }

        if (this.albumCover && (albumChanged || !this.images.length)) {
          this.images.unshift(this.albumCover);
        }

        if (artistChanged && this.showPictures) {
          this.loadPictures(this.artist);
        }        
        
        this.changePicture({force: true});
      }
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
        
        var ww = $(window).width();
        var wh = $(window).height();
        var maxRatio = 5;
        
        _.each(data.images.image, function(v, i) {
          if (!v || !v.sizes || !v.sizes.size || !v.sizes.size[0]) {
            return;
          }
          
          var item = v.sizes.size[0];
          var width = parseInt(item.width, 10);
          var height = parseInt(item.height, 10);
          if (ww / width > maxRatio || wh / height > maxRatio) {
            return;
          }
          
          var url = item['#text'];
          if (url) {
            self.lastfmImages.push(url);
          }
        });
        
        self.changePicture();
      });      
    },

    // ----------
    changePicture: function(config) {
      var self = this;
      config = config || {};
      
      if (config.force) {
        if (this.pictureTimeout) {
          clearTimeout(this.pictureTimeout);
          this.pictureTimeout = null;
        }
        
        if (this.$loadingImage) {
          this.$loadingImage.data('abort', true);
          this.$loadingImage.attr('src', '');
          this.$loadingImage = null;
        }
      } else if (this.pictureTimeout || this.$loadingImage) {
        return;
      }

      var fireNext = function() {
        self.pictureTimeout = setTimeout(function() {
          self.pictureTimeout = null;
          self.changePicture();
        }, self.slideSpeed);
      };
      
      var url = this.images.shift();
      if (!url) {
        this.images = _.shuffle(this.lastfmImages);
        if (this.albumCover) {
          this.images.push(this.albumCover);
        }
        
        url = this.images.shift();
        if (!url) {
          url = this.albumCover;
        }
      }
      
      if (url === this.currentImageUrl) {
        fireNext();
        return;
      }
      
      this.$loadingImage = $('<img>')
        .load(function() {
          if ($(this).data('abort')) {
            return;
          }
          
          self.$loadingImage = false;
          self.swapPictures(url);
          fireNext();
        })
        .error(function() {
          if ($(this).data('abort')) {
            return;
          }
          
          self.$loadingImage = false;
          self.changePicture();
        });
        
      this.$loadingImage.attr('src', url);
    },
    
    // ----------
    swapPictures: function(url) {
      var self = this;
    
      this.$nextPicture.css({
        'background-image': 'url("' + url + '")'
      });
      
      this.currentImageUrl = url;
      
      this.$currentPicture.css({
        opacity: 0
      });
      
      setTimeout(function() {
        self.$nextPicture.css({
          'z-index': 10
        });

        self.$currentPicture.css({
          'z-index': 1,
          opacity: 1
        });
        
        var temp = self.$nextPicture;
        self.$nextPicture = self.$currentPicture;
        self.$currentPicture = temp;
      }, this.fadeSpeed);
    }
  };

})();
