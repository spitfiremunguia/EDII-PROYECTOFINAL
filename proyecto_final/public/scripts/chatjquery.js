var Message;
var message_side = "left";
var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; 

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


jQuery(function ($) {

    $queryBox = $("#query-box");
    $queryBox.keyup(function (e) {
        if (e.which === 13) {
            var data = {
                query: $queryBox.val(),
                user: $nickBox.val()
            }
            socket.emit('query-request', data, function(data){
                
            });
        }
    });

    $(".users").on("click",
        function (e) {
            $messages = $('.messages');
            if ($(e.target).is(".contact")) {
                localStorage.setItem("destinatario", e.target.id);
                console.log(localStorage.getItem("destinatario"));
                socket.emit('req-load-messages', { emisor: $nickBox.val(), receptor: localStorage.getItem("destinatario") }, function (data) {
                    // En caso de errores
                });
                var html = '';
                $messages.html(html);
            }
        });
    var $nickBox = $('#nickbox');
    $(function () {

        socket.emit('new-user', $nickBox.val(), function (data) {
            // En caso de error
        });
    });

    var socket = io.connect();
    var $sendButton = $('#send-message-button');
    var $messageBox = $('#message_input');
    var $fileSelector = $('#sampleFile');
    var $attachFileButton = $("#attachFile");

    $attachFileButton.click(function (e) {
    
        event.preventDefault();
        socket.emit('send-message', { message: $fileSelector.val(), destinatario: localStorage.getItem("destinatario") }, function (data) {
            // Qué pasa si hay error? :S
        });
        if(socket.nickname == $nickBox.val())
        console.log("Emisor: " + socket.nickname);
    });
    $sendButton.click(function (e) {
        socket.emit('send-message', { message: $messageBox.val(), destinatario: localStorage.getItem("destinatario") }, function (data) {
            // Qué pasa si hay error? :S
        });
        if(socket.nickname == $nickBox.val())
        console.log("Emisor: " + socket.nickname);


    });
    socket.on('new-message', function (data) {
        var d = new Date(); 
        sendMessage("<b>"+data.nick+": </b>" +weekday[d.getDay()]+" "+d.getHours()+":"+d.getMinutes() +"<br>"   +data.msg, data.side);  
        if(data.nick == $nickBox.val()){
            $messageBox.val('');
        }       
    });
    socket.on('whisper', function (data) {
        var d = new Date();
        if (data.nick == socket.nickname)
            message_side = "right";
        else
            message_side = "left";

        if(data.nick == $nickBox.val()){
            $messageBox.val('');
        } 
        console.log(message_side);
        sendMessage("<b>"+data.nick+": </b>" +weekday[d.getDay()]+" "+d.getHours()+":"+d.getMinutes() +"<br>"   +data.msg, data.side);  
        
    });

    sendMessage = function (text, side) {
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
        return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 20);
    };
    $messageBox.keyup(function (e) {
        if (e.which === 13) {
            $sendButton.click();
        }
    });
    socket.on('usernames', function (data) {
        var onlineHtml = "<div class='title'>Available Users</div>";
        onlineHtml += "<ol background='images/chatbackground.jpg' class='rounded-list'>";
        
        for (var i = 0; i < data.online.length; i++) {
            if (data.online[i] != $nickBox.val())
            onlineHtml += "<li  ><a id='" + data.online[i] + "' class='contact'>" + data.online[i] + '</a></li>';
        }
        $('#available-users').html(onlineHtml);

        var offlineHtml = "<div class='title'>Offline Users</div>";
        offlineHtml += "<ol background='images/chatbackground.jpg' class='rounded-list'>";
        
        for(var i = 0; i < data.offline.length; i++){
            if(data.offline[i] != $nickBox.val())
                offlineHtml += "<li  ><a id='" + data.offline[i] + "' class='contact'>" + data.offline[i] + '</a></li>';
        }
        $('#unavailable-users').html(offlineHtml);
    });

    socket.on('redirect', function (dest) {
        window.location.href = dest;
    });

    socket.on('query-response', function(docs){
        $messages = $('.messages');
        $messages.html('');
        for(var i = docs.length-1; i>=0; i--){
            
            var d = new Date(docs[i].created);
            if(docs[i].emisor == $nickBox.val()){
                sendMessage("<b>"+docs[i].emisor+": </b>" +weekday[d.getDay()]+" "+d.getHours()+":"+d.getMinutes() +"<br>"   + docs[i].msg, "right");  
            }else{
                sendMessage("<b>"+docs[i].emisor+": </b>" +weekday[d.getDay()]+" "+d.getHours()+":"+d.getMinutes() +"<br>"   + docs[i].msg, "left");  
                
            }
        }
    });
    socket.on('res-load-messages', function (docs) {
        console.log("retrieving...");
        console.log("Emisor: " + $nickBox.val());
        console.log("Receptor: " + localStorage.getItem("destinatario"));
        
        for (var i = docs.length - 1; i >= 0; i--) {
            var d = new Date(docs[i].created); 
            if (docs[i].emisor == $nickBox.val() && docs[i].receptor == localStorage.getItem("destinatario"))
            sendMessage("<b>"+docs[i].emisor+": </b>" +weekday[d.getDay()]+" "+d.getHours()+":"+d.getMinutes() +"<br>"   + docs[i].msg, "right");  
            else if (docs[i].receptor == $nickBox.val() && docs[i].emisor == localStorage.getItem("destinatario")) {
                sendMessage("<b>"+docs[i].emisor+": </b>" +weekday[d.getDay()]+" "+d.getHours()+":"+d.getMinutes() +"<br>"   + docs[i].msg, "left");  
            }            
        }
    });

});