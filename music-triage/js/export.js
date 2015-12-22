(function() {

  window.Export = {
    init: function() {
      var self = this;

      this.rdioKeys = [];
      
      var doOne = function(key) {
        if (!/history-triage-/.test(key)) {
          return;
        }

        var data = localStorage[key];
        data = JSON.parse(data);
        if (data.rejected) {
          self.rdioKeys.push(key.replace(/history-triage-/, ''));
          // console.log(key, data);
        }
      };

      for (var i = 0; i < localStorage.length; i++) {
        doOne(localStorage.key(i));
      }

      $('.count').text('(' + this.rdioKeys.length + (this.rdioKeys.length === 1 ? ' album)' : ' albums)'));

      $('.export-button').on('click', function() {
        self._export();
      });
    },

    // ----------
    _export: function() {
      var self = this;

      $('.before-export').hide();
      $('.during-export').show();

      if (!this.rdioKeys.length) {
        $('.error').text('Your dustbin is empty...nothing to export.');
        return;
      }

      R.ready(function() {
        R.request({
          method: 'get', 
          content: {
            keys: self.rdioKeys.join(',') 
          }, 
          success: function(response) {
            $('.during-export').hide();
            $('.after-export').show();
            $('.download').prop({
              href: 'data:application/json;charset=utf-8;base64,' + btoa(JSON.stringify(response, null, 2))
            });
            // console.log(response);
          },
          error: function(response) {
            $('.error').text(response.message);
            $('.during-export').hide();
          }
        }); 
      });
    }
  };
  
  $(document).ready(function() {
    Export.init();
  });
  
})();  
