function addToTopOfQueue(sourceKey) {
  var handler = function(model, collection, info) {
    if (model.get('key') == sourceKey) {    
      R.player.queue.off('add', handler);
      R.player.queue.move(info.index, 0);
    }
  };

  R.player.queue.on('add', handler);
  R.player.queue.add(sourceKey);
}
