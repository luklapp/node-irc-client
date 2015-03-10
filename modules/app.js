      var fs = require('fs');
      var irc = require('irc');
      var msg = require('./Message');
      require('./emoticons');
      $ = require('jquery');

      var messages = [];
      var users = [];
      var username = '';

      var client = new irc.Client('chat.freenode.net', 'Fleischkaesebroetchen', {});

      startLoading();

      client.addListener('error', function(message) {
          if(message!="") console.log('error: ', message);
      });

      client.addListener('message', function(from, to, message) {

          var message = new msg.Message(from, to, message, (to == client.nick));
          messages.push(message);
          drawMessage(message);

      });

      client.addListener('names', function(channel, nicks) {
          users = Object.keys(nicks);
          updateUserList();
      });

      client.addListener('registered', function() {
          stopLoading();
      });

      client.addListener('join', function(channel, nick, message) {

          var message = new msg.Message("Server", "#schnitzelwirt", nick + " joined #schnitzelwirt");

          // Userliste updaten
          if (nick != client.nick) {
              users.push(nick);
              updateUserList();
          }

          messages.push(message);
          drawMessage(message);

      });

      client.addListener('quit', function(nick, reason, channels, message) {
          var message = new msg.Message("Server", "#schnitzelwirt", nick + " left #schnitzelwirt", false);

          messages.push(message);
          drawMessage(message);

          // Userliste updaten
          users.splice(users.indexOf(nick), 1);
          updateUserList();
      });

      client.addListener('nick', function(oldnick, newnick, channels, message) {
          if (newnick != username) {

              var message = new msg.Message("Server", "#schnitzelwirt", oldnick + " is now known as " + newnick, false);
              messages.push(message);
              drawMessage(message);

              // Userliste updaten
              users[users.indexOf(oldnick)] = newnick;
              updateUserList();
          }

      });

      $('#input').keypress(function(e) {
          if (e.which == 13) {
              sendMessage();
          }
      });

      $("#fileDialog").on("change", function(evt) {

          fs.writeFile(this.value, $('#messages').html(), function(err) {
              if (err) {
                  console.log(err);
              }
          });

      });

      $('#join').on('click', function() {
          join();
      });

      $('#toggleEmoticons').on('click', function() {
          $('#emoticons').fadeToggle();
      })

      $('#sendButton').on('click', function() {
          sendMessage();
      })

      $('#fileDialogButton').on('click', function() {
          chooseFile("#fileDialog");
      });

      function startLoading() {
          $('#loading').css('display', 'block');
      }

      function stopLoading() {
          $('#loading').css('display', 'none');
      }

      function join() {
          changeNickname();
          client.join('#schnitzelwirt', stopLoading);
          startLoading();
          $('#startScreen').css('display', 'none');
      }

      (function drawEmoticonsToScreen() {
          var i = 0;

          emoticons.forEach(function(emoticon) {
              $('#emoticons').append(" <img id=\"emoticon" + i + "\" src='emoticons/" + emoticon[1] + "'> ");
              $('#emoticon' + i).on('click', function() {
                  addEmoticon(emoticon[0]);
              });

              i++;
          });
      })();

      function drawMessage(message) {

          // Nachricht zum DIV hinzufügen
          $('#messages').append(message.toString());

          // Nach unten 'scrollen'
          $('#messages').animate({
              scrollTop: $('#messages')[0].scrollHeight
          }, 2000);

      }

      function sendMessage() {

          $('#emoticons').fadeOut();

          var message = new msg.Message("me", "#schnitzelwirt", $('#input').val(), false);

          if (message.message != "") {
              client.say(message.to, message.message);
              messages.push(message);
              drawMessage(message);
          }

          $('#input').val("");

      }

      function updateUserList() {

          $('#userList').html("<h3>" + users.length + " User online</h3>");
          var $elem = null;

          users.forEach(function(user) {

              $elem = $('#userList').append('<div id="' + user + '">' + user + '</div>');

              $('#' + user).on("click", function() {
                  $("#input").val("@" + user + " " + $("#input").val());
                  $("#input").focus();
              });

          });
      }

      function changeNickname() {
          username = $('#nickInput').val();
          client.send("NICK", username);
      }

      function addEmoticon(emoticon) {
          $("#input").val($("#input").val() + emoticon);
      }

      function chooseFile(name) {
          $(name).click();
      }