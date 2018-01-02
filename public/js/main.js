
var app = {

  rooms: function(){

    var socket = io('/rooms', { transports: ['websocket'] });

    // Retourne une liste de canaux
    socket.on('connect', function () {

      // Mettre à jour les canaux
      socket.on('updateRoomsList', function(room) {

        // Message d'erreur lors d'une création d'un canal
        $('.room-create p.message').remove();
        if(room.error != null){
          $('.room-create').append(`<p class="message error">${room.error}</p>`);
        }else{
          app.helpers.updateRoomsList(room);
        }
      });

      // Nouveau canal crée
      $('.room-create button').on('click', function(e) {
        var inputEle = $("input[name='title']");
        var roomTitle = inputEle.val().trim();
        if(roomTitle !== '') {
          socket.emit('createRoom', roomTitle);
          inputEle.val('');
        }
      });

    });
  },

  chat: function(roomId, username){
    
    var socket = io('/chatroom', { transports: ['websocket'] });

      // Connexion au canal actuel
      socket.on('connect', function () {

        socket.emit('join', roomId);

        // Mettre à jour la liste d'utilisateurs
        socket.on('updateUsersList', function(users, clear) {

          $('.container p.message').remove();
          if(users.error != null){
            $('.container').html(`<p class="message error">${users.error}</p>`);
          }else{
            app.helpers.updateUsersList(users, clear);
          }
        });

        // Envoi d'un message
        $(".chat-message button").on('click', function(e) {

          var textareaEle = $("textarea[name='message']");
          var messageContent = textareaEle.val().trim();
          if(messageContent !== '') {
            var message = { 
              content: messageContent, 
              username: username,
              date: Date.now(),
            };

            socket.emit('newMessage', roomId, message);
            textareaEle.val('');
            app.helpers.addMessage(message);
          }
        });

        // Enlever l'utlisateur lorsqu'il quitte le canal
        socket.on('removeUser', function(userId) {
          $('li#user-' + userId).remove();
          app.helpers.updateNumOfUsers();
        });

        // Afficher message 
        socket.on('addMessage', function(message) {
          app.helpers.addMessage(message);
        });
      });
  },

  helpers: {

    encodeHTML: function (str){
      return $('<div />').text(str).html();
    },

    // Mettre à jour la liste des canaux
    updateRoomsList: function(room){
      room.title = this.encodeHTML(room.title);
      var html = `<a href="/chat/${room._id}"><li class="room-item">${room.title}</li></a>`;

      if(html === ''){ return; }

      if($(".room-list ul li").length > 0){
        $('.room-list ul').prepend(html);
      }else{
        $('.room-list ul').html('').html(html);
      }
      
      this.updateNumOfRooms();
    },

    // Mettre à jour la liste des utilisateurs
    updateUsersList: function(users, clear){
        if(users.constructor !== Array){
          users = [users];
        }

        var html = '';
        for(var user of users) {
          user.username = this.encodeHTML(user.username);
          html += `<li class="clearfix" id="user-${user._id}">
                     <img src="${user.picture}" alt="${user.username}" />
                     <div class="about">
                        <div class="name">${user.username}</div>
                        <div class="status"><i class="fa fa-circle online"></i> online</div>
                     </div></li>`;
        }

        if(html === ''){ return; }

        if(clear != null && clear == true){
          $('.users-list ul').html('').html(html);
        }else{
          $('.users-list ul').prepend(html);
        }

        this.updateNumOfUsers();
    },

    // Afficher un message dans l'historique
    addMessage: function(message){
      message.date      = (new Date(message.date)).toLocaleString();
      message.username  = this.encodeHTML(message.username);
      message.content   = this.encodeHTML(message.content);

      var html = `<li>
                    <div class="message-data">
                      <span class="message-data-name">${message.username}</span>
                      <span class="message-data-time">${message.date}</span>
                    </div>
                    <div class="message my-message" dir="auto">${message.content}</div>
                  </li>`;
      $(html).hide().appendTo('.chat-history ul').slideDown(200);

      // Laisser le scroll bar en bas
      $(".chat-history").animate({ scrollTop: $('.chat-history')[0].scrollHeight}, 1000);
    },

    // Mettre à jour le nombre de canaux 
    updateNumOfRooms: function(){
      var num = $('.room-list ul li').length;
      $('.room-num-rooms').text(num +  " Room(s)");
    },

    // Mettre à jour le nombre d'utilisateurs en ligne sur le canal actuel
    updateNumOfUsers: function(){
      var num = $('.users-list ul li').length;
      $('.chat-num-users').text(num +  " User(s)");
    }
  }
};
