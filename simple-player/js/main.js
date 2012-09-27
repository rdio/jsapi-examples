/*globals R, Main */

(function() {

  window.Main = {
    // ----------
    init: function() {
      var self = this;
      
      this.$input = $(".search input");
      _.defer(function() {
        self.$input.focus();
      });
        
      $(".search")
        .submit(function(event) {
          event.preventDefault();
          var query = self.$input.val();
          if (query) {
            self.search(query);
          }
        });
    }, 
    
    // ----------
    search: function(query) {
      var self = this;
      R.ready(function() {
        R.request({
          method: "search", 
          content: {
            query: query, 
            types: "Album"
          },
          success: function(response) {
            self.$input.val("");
            self.showResults(response.result.results);
          },
          error: function(response) {
            $(".error").text(response.message);
          }
        });
      });
    },
    
    // ----------
    showResults: function(albums) {
      var $results = $(".results")
        .empty();
        
      var template = _.template($("#album-template").text());

      _.each(albums, function(v, i) {
        var $el = $(template(v))
          .appendTo($results);
      });
    }
  };
  
  // ----------
  $(document).ready(function() {
    Main.init();
  });
  
})();  
