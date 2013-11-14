/*globals rdioUtils, Main, R */

(function() {

  // ----------
  window.Main = {
    // ----------
    init: function() {
      var self = this;

      if (!rdioUtils.startupChecks()) {
        return;
      }

      R.ready(function() {
        if (R.authenticated()) {
          self.start();
        } else {
          $('.unauthenticated').show();
          $('.auth').click(function() {
            R.authenticate(function() {
              if (R.authenticated()) {
                $('.unauthenticated').hide();
                self.start();
              }
            });
          });
        }
      });
    },

    // ----------
    start: function() {
      var self = this;
      
      $('.authenticated').show();
      $('.now-playing img').prop('src', R.player.playingSource().get('icon'));

      this.updateQueue();
      R.player.queue.on('reset', this.updateQueue, this);
      
      R.player.queue.on('add', function(model, collection, info) {
        self.newQueueItem(model.toJSON(), info.index);
      });

      R.player.queue.on('remove', function() {
        console.log('remove', arguments);
      });
    },

    // ----------
    updateQueue: function() {
      $('.queue').empty();

      for (var i = 0; i < R.player.queue.length(); i++) {
        this.newQueueItem(R.player.queue.at(i).toJSON());
      }
    },

    // ----------
    newQueueItem: function(data, index) {
      var $item = this.template('queue-item', data);

      if (index === 0) {
        $item.prependTo('.queue');
      } else {
        var $before = $('.queue .queue-item').eq(index - 1);
        if ($before.length) {
          $item.insertAfter($before);
        } else {
          $item.appendTo('.queue');
        }
      } 

      var drag = null;

      var moveHandler = function(event) {
        $item.css({
          top: event.clientY - drag.startY
        });
      };

      var upHandler = function(event) {
        $item.unbind('mousemove', moveHandler);
        $item.unbind('mouseup', upHandler);
        $item.removeClass('dragging');
        drag = null;
      };

      $item.find('.grip')
        .mousedown(function(event) {
          drag = {
            startX: event.clientX,
            startY: event.clientY
          };

          $item.mousemove(moveHandler);
          $item.mouseup(upHandler);
          $item.addClass('dragging');
        });
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
