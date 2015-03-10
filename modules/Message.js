      require('./emoticons');

      function Message(from, to, message, private) {
          this.from = from;
          this.to = to;
          this.message = message;
          this.private = private;

          if (message[0] == '@') {
              this.to = message.slice(1, message.indexOf(" ")), message;
              this.message = message.slice(message.indexOf(" "));
              this.private = true;
          }

      }

      Message.prototype.toString = function() {

          var classes = '';
          var now = new Date();

          if (this.private == true) classes = classes + "private ";
          if (this.from == 'Server') classes = classes + "server ";

          // Escape HTML
          this.message = this.message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

          // Smileys einsetzen
          this.message = this.drawEmoticons(this.message);

          return "<div class='" + classes + "'><span class='small'>" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "</span> " + this.from + ' => ' + this.to + ': ' + this.message + "</div>";

      }

      Message.prototype.drawEmoticons = function(msg) {

          emoticons.forEach(function(emoticon) {
              while (msg.indexOf(emoticon[0]) != -1) {
                  msg = msg.replace(emoticon[0], '<img src="emoticons/' + emoticon[1] + '">');
              }
          });

          return msg;

      }

      exports.Message = Message;