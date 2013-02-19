/*globals Main, R, Spinner, alert */

(function() {

  // ==========
  Main.CollectionButton = function($el) {
    var self = this;
    this.$el = $el
      .click(function() {
        self.addToCollection();
      });

    this.spinner = new Spinner({
      color: '#fff', 
      shadow: true
    });
  };
  
  Main.CollectionButton.prototype = {
    // ----------
    addToCollection: function() {
      var self = this;
      
      var source = R.player.playingSource();
      var type = (source ? source.get('type') : '');
      var keys = '';
      if (type == 'a') {
        keys = source.get('trackKeys').join(',');
      } else if (type == 'p' || type == 't') {
        keys = source.get('key');
      } 

      if (!keys) {
        return;
      }
    
      this.spinner.spin(this.$el[0]);
      R.request({
        method: 'addToCollection', 
        content: {
          keys: keys
        }, 
        complete: function(data) {
          self.spinner.stop();
          if (data.status == 'ok') {
            self.$el.addClass('selected');
          } else {
            alert('There was an error adding this album to your collection.');
          }
        }
      });
    }
  };

})();
