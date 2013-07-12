/*globals rdioUtils, Main, R */

(function() {

  // ----------
  window.Main = {
    $albums: {},

    // ----------
    init: function() {
      var self = this;
      
      if (!rdioUtils.startupChecks()) {
        return;
      }

      R.ready(function() {
        R.request({
          method: "getTopCharts", 
          content: {
            type: "Album"
          },
          success: function(response) {
            if (!response.result || !response.result.length) {
              self.log('Unable to find album.');
              return;
            }

            _.each(response.result, function(v, i) {
              var widget = rdioUtils.albumWidget(v);
              $('body').append(widget.element());
            });
          },
          error: function(response) {
            self.log(response.message);
          }
        });
      });
    },

    // ----------
    log: function(message) {
      $('<p>')
        .text(message)
        .appendTo('.log');
    },

    // ----------
    template: function(name, config) {
      var rawTemplate = $.trim($("#" + name + "-template").text());
      var template = _.template(rawTemplate);
      var html = template(config);
      return $(html);
    }
  };

  // ----------
  $(document).ready(function() {
    Main.init();
  });

})();
