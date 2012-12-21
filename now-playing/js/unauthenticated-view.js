/*globals Main, R */

(function() {

  // ==========
  Main.Views.Unauthenticated = function() {
    $("#authenticate")
      .click(function() {
        R.authenticate(function(authenticated) {
          if (authenticated) {
            Main.go("pictures");
          }
        });
      });
  };
  
})();  
