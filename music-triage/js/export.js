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
            var output = JSON.stringify(response, null, 2);
            output = b64EncodeUnicode(output);
            $('.during-export').hide();
            $('.after-export').show();
            $('.download').prop({
              href: 'data:application/json;charset=utf-16le;base64,' + output
            });

            var count = _.keys(response.result).length;
            $('.after-count').text(' (' + count + (count === 1 ? ' album)' : ' albums)'));
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
  
  // ----------
  // From https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
  function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
  }

  $(document).ready(function() {
    Export.init();
  });
  
})();  
