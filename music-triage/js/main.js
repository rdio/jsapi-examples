/*globals R, zot, Album, Main, Music, Spinner */

(function() {

  window.Main = {
    albums: [], 
    rejectedAlbums: [],
    collectedAlbums: [],
    albumTemplate: null,
    nextIndex: 0,
    chunkSize: 20,
    spinner: null,
    
    init: function() {
      var self = this;
  
      this.albumTemplate = _.template($("#album-template").text());
      
      $("#authenticate")
        .click(function() {
          R.authenticate(function(authenticated) {
            if (authenticated) {
              self.becameAuthenticated();
            }
          });
        });
        
      $(window)
        .resize(function() {
          self.layout();
        });
      
      if (!("R" in window)) {
        $("#no-rdio").show();
      } else {
        R.ready(function() {
          Music.init();
          if (R.authenticated()) {
            self.becameAuthenticated();
          } else {
            self.spinner.stop();
            $("#unauthenticated").show();
          }          
        });
        
        this.spinner = new Spinner().spin($("body")[0]);
      }
    },
    
    becameAuthenticated: function() {
      this.spinner.spin($("body")[0]);
      $("#unauthenticated").hide();
      $("#authenticated").show();
      this.addAlbums();
      this.getCollection();
    },
    
    getCollection: function() {
      var self = this;
      var start = 0;
      var count = 200;
      
      function getChunk() {
        R.request({
          method: "getAlbumsInCollection", 
          content: {
            user: R.currentUser.get("key"), 
            start: start,
            count: count,
            extras: "-*,albumKey",
            sort: "dateAdded"
          }, 
          complete: function(data) {
            if (data && data.result && data.result.length) {
              _.each(data.result, function(v, i) {
                self.save(v.albumKey, {collected: true});
                var album = self.album(v.albumKey);
                if (album) {
                  self.collectAlbum(album);
                }
              });
              
              getChunk();
            }
          }
        });      
        
        start += count;
      }
      
      getChunk();
    },
    
    addAlbums: function() {
      var self = this;
      
      if (this.nextIndex == -1) {
        return;
      } 
      
      R.request({
        method: "getPlayHistory", 
        content: {
          user: R.currentUser.get("key"), 
          start: self.nextIndex,
          count: self.chunkSize
        }, 
        complete: function(data) {
          self.spinner.stop();
          
          if (!data.result.length) {
            self.nextIndex = -1;
            return;
          }
          
          _.each(data.result, function(v, i) {
            var album = new Album(v);
            if (!album.viable()) {
              return;
            }
            
            var group = self.albums;
            var record = localStorage[self.recordKey(album.key)];
            if (record) {
              record = JSON.parse(record);
              if (record.collected) {
                album.becomeSmall();
                group = self.collectedAlbums;
              } else if (record.rejected) {
                album.becomeSmall();
                group = self.rejectedAlbums;
              }
            }
            
            if (_.where(group, {key: album.key}).length) {
              return;
            }
            
            album.create();
            group.push(album);
          });
          
          self.layout();
          if (self.albums.length < self.chunkSize) {
            self.addAlbums();
          }
        }
      });
      
      this.nextIndex += this.chunkSize;
    },
    
    album: function(key) {
      return _.find(this.albums, function(album) {
        return album.key == key; 
      });
    },
    
    removeAlbum: function(album) {
      album.destroy();
      this.albums = _.without(this.albums, album);
      this.layout();
      
      if (this.albums.length < this.chunkSize) {
        this.addAlbums();
      }
    }, 
    
    rejectAlbum: function(album) {
      this.moveAlbumTo(album, this.rejectedAlbums);
    },
    
    collectAlbum: function(album) {
      this.moveAlbumTo(album, this.collectedAlbums);
    },
    
    moveAlbumTo: function(album, albums) {
      albums.unshift(album);
      this.albums = _.without(this.albums, album);
      
      album.becomeSmall();
      this.layout({animate: true});
      
      if (this.albums.length < this.chunkSize) {
        this.addAlbums();
      }
    },
    
    layout: function(options) {
      options = options || {};
      var naturalSize = 200;
      var halfNaturalSize = naturalSize / 2;
      
      function oneSet(config) {
        var scale = config.albumSize / naturalSize;
        var halfSize = config.albumSize / 2;
        var albumOffset = halfSize - halfNaturalSize;
        var offset = config.bounds.topLeft().plus(new zot.point(albumOffset, albumOffset));
        var pt = new zot.point(config.start.x, config.start.y);
        _.each(config.albums, function(v, i) {
          var css = {
            translateX: offset.x + pt.x, 
            translateY: offset.y + pt.y,
            scale: scale
          };
          
          if (options.animate) {
            v.$el.animate(css);
          } else {
            v.$el.css(css);
          }
          
          pt.x += config.albumSize + config.buffer;
          if (pt.x + config.albumSize + config.buffer > config.bounds.width) {
            pt.y += config.albumSize + config.buffer;
            pt.x = config.start.x;
          }
        });
      }
      
      var config = {
        albums: this.albums,
        bounds: zot.bounds($("#history")),
        albumSize: naturalSize,
        buffer: 20
      };
      
      var columns = Math.floor(config.bounds.width / (config.albumSize + config.buffer));
      var contentWidth = (columns * config.albumSize) + ((columns - 1) * config.buffer);
      config.start = new zot.point((config.bounds.width - contentWidth) / 2, 60);
      oneSet(config);
      
      oneSet({
        albums: this.rejectedAlbums,
        bounds: zot.bounds($("#rejects")),
        albumSize: 100,
        buffer: 10,
        start: new zot.point(10, 60)
      });
      
      oneSet({
        albums: this.collectedAlbums,
        bounds: zot.bounds($("#collection")),
        albumSize: 100,
        buffer: 10,
        start: new zot.point(10, 60)
      });
    },
    
    recordKey: function(albumKey) {
      return "history-triage-" + albumKey;
    },
    
    save: function(albumKey, data) {
      localStorage[this.recordKey(albumKey)] = JSON.stringify(data);
    }
  };
  
  $(document).ready(function() {
    Main.init();
  });
  
})();  
