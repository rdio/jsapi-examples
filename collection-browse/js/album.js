/*globals Main */

function Album(config) {
  config.appUrl = config.shortUrl.replace("http", "rdio");
  this.$el = Main.template("album", config);
}

Album.prototype = {
};