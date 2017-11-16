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
    var $attachFileButton = $("#attachFile");


    $(".available-users").on("click",
    function(e){
        $messages = $('.messages');
        if($(e.target).is(".contact")){
            localStorage.setItem("destinatario", e.target.id);
            console.log(localStorage.getItem("destinatario"));
            socket.emit('req-load-messages', {emisor: $nickBox.val(), receptor: localStorage.getItem("destinatario")}, function(data){
                // En caso de errores
            });
            var html =  '';
            $messages.html(html);
        }          
    }); 
    var $nickBox = $('#nickbox');
    $(function(){
        
        socket.emit('new-user', $nickBox.val(), function(data){
            // En caso de error
        });
    });
     
      var socket = io.connect();
      var $sendButton = $('#send-message-button');
      var $messageBox = $('#message_input');
      var $fileSelector = $('#file-selector');

    
      $sendButton.click(function(e){
        socket.emit('send-message', {message: $messageBox.val() , destinatario: localStorage.getItem("destinatario")}, function(data){
          // Qué pasa si hay error? :S
        });
        $messageBox.val('');
        console.log("Emisor: " + socket.nickname);
        
        
      });
    socket.on('new-message', function(data){        
        sendMessage("<b>"+data.nick+"</b>: " + data.msg, data.side);
    });
    socket.on('whisper', function(data){
        if(data.nick == socket.nickname)
        message_side = "right";
    else
        message_side = "left";
    console.log(message_side);
    sendMessage("<b>"+data.nick+"</b>: " + data.msg, data.side);    

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
    $messageBox.keyup(function (e) {
        if (e.which === 13) {
            $sendButton.click();
        }
    });             
    socket.on('usernames', function(data){
        var html = "<div class='title'>Available Users</div>";
        html += "<ol background='images/chatbackground.jpg' class='rounded-list'>";
        for(var i = 6; i < data.length; i++){
            if(data[i] != $nickBox.val())
            html += "<li  ><a id='"+data[i]+"' class='contact'>" +data[i]+'</a></li>';
        }
        $('.available-users').html(html);
    });

    socket.on('redirect',function(dest){ 
        window.location.href = dest; 
    }); 

    socket.on('res-load-messages', function(docs){
        console.log("retrieving...");
        console.log("Emisor: " + $nickBox.val());
        console.log("Receptor: " + localStorage.getItem("destinatario"));
        for(var i = docs.length-1; i >= 0; i--){
            if(docs[i].emisor == $nickBox.val() && docs[i].receptor == localStorage.getItem("destinatario"))
                sendMessage("<b>"+docs[i].emisor+"</b>: " + docs[i].msg, "right"); 
            else if(docs[i].receptor == $nickBox.val() && docs[i].emisor == localStorage.getItem("destinatario")){
                sendMessage("<b>"+docs[i].emisor+"</b>: " + docs[i].msg, "left"); 
            }   
        }
    });

});