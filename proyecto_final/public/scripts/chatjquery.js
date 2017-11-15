var Message;
var message_side = "left";
Message = function (arg) {
    this.text = arg.text, this.message_side = arg.message_side;
    this.draw = function (_this) {
        return function () {
            var $message;
            $message = $($('.message_template').clone().html());
            $message.addClass(_this.message_side).find('.text').html(_this.text);
            $('.messages').append($message);
            return setTimeout(function () {
                return $message.addClass('appeared');
            }, 0);
        };
    }(this);
    return this;
};


  jQuery(function($){
   
    $(".available-users").on("click",
    function(e){
        console.log("detected licked");
        if($(e.target).is(".contact"))
             console.log(e.target.id);            
    }); 
    var $nickBox = $('#nickbox');
    $(function(){
        socket.emit('new-user', $nickBox.val(), function(data){
            // En caso de error
        });
    });
      message_side = "right";message_side = "right";
      var socket = io.connect();
      var $sendButton = $('#send-message-button');
      var $messageBox = $('#message_input');
      $sendButton.click(function(e){
        socket.emit('send-message', $messageBox.val(), function(data){
          // Qué pasa si hay error? :S
        });
        $messageBox.val('');
        console.log("Emisor: " + socket.nickname);
        
      });
       socket.on('new-message', function(data){
         if(data.nick == socket.nickname)
          message_side = "left";
          else
            message_side = "right";
        console.log(message_side);
        sendMessage(data.nick + data.msg, message_side);
      });
      sendMessage = function (text, side) {
        $messageBox.val('');
        var $messages, message;
        if (text.trim() === '') {
            return;
        }
        $messages = $('.messages');
        message_side = side;
        message = new Message({
            text: text,
            message_side: message_side
        });
        message.draw();
        return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
    };
    $sendButton.click(function (e) {
        return sendMessage($messageBox.val());
    });
    $messageBox.keyup(function (e) {
        if (e.which === 13) {
            $sendButton.click();
        }
    });             
    socket.on('usernames', function(data){
        var html = "<div class='title'>Available Users</div>";
        html += "<ol class='rounded-list'>";
        for(var i = 6; i < data.length; i++){
            html += "<li  ><a id='"+data[i]+"' class='contact'>" +data[i]+'</a></li>';
        }
        $('.available-users').html(html);
    });      
  });