(function() {

  window.Export = {
    init: function() {
      var self = this;
      
      var doOne = function(key) {
        if (!/history-triage-/.test(key)) {
          return;
        }

        var data = localStorage[key];
        data = JSON.parse(data);
        if (data.rejected) {
          console.log(key, data);
        }
      };

      for (var i = 0; i < localStorage.length; i++) {
        doOne(localStorage.key(i));
      }
    }
  };
  
  $(document).ready(function() {
    Export.init();
  });
  
})();  
