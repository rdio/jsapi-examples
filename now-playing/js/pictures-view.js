/*globals Main, R, Backbone */

(function() {

  // ==========
  Main.Views.Pictures = function() {
    var self = this;
    this.$el = $('#content');
    this.$artist = this.$el.find('.artist');
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
    this.imageLoading = false;
    this.slideSpeed = 6000;
    this.fadeSpeed = 2000; // Needs to be the same as the transition speed for .picture in the css

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
      
      if (location.search.search(/pics=false/i) == -1) {
        this.loadPictures(this.artist);
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
    changePicture: function() {
      var self = this;
      
      if (self.pictureTimeout || this.imageLoading) {
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
      
      this.imageLoading = true;
      $('<img>')
        .load(function() {
          self.imageLoading = false;
          self.swapPictures(url);
          fireNext();
        })
        .error(function() {
          self.imageLoading = false;
          self.changePicture();
        })
        .attr('src', url);
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
