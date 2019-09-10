"use strict"; //use es6

document.addEventListener('DOMContentLoaded', function() {
    Notification.requestPermission(function(status) {
        // This allows to use Notification.permission with Chrome/Safari
        if (Notification.permission !== status) {
            Notification.permission = status;
        }
    });
});

function browserMessage(theTitle, theBody, theIcon='https://s3-ap-southeast-1.amazonaws.com/gamefilelib/cashNet/mobile/icon/UNDERCONSTRUCTION.png') {
    // If the user agreed to get notified
    // Let's try to send ten notifications
    let n;

    if (window.Notification && Notification.permission === "granted") {

        var option = {
            body: theBody,
            icon:theIcon,
            tag: 'soManyNotification'
        };
        alert(theTitle+',' +theBody);
        //n = new Notification(theTitle, option);
        // setTimeout(n.close.bind(n), 4000);
    }

    // If the user hasn't told if he wants to be notified or not
    // Note: because of Chrome, we are not sure the permission property
    // is set, therefore it's unsafe to check for the "default" value.
    else if (window.Notification && Notification.permission !== "denied") {

        Notification.onclick = (event)=>{
          event.preventDefault(); // prevent the browser from focusing the Notification's tab
          n.close();
        };

        Notification.requestPermission(function(status) {
            // If the user said okay
            if (status === "granted") {
                var option = {
                    body: theBody,
                    //icon:theIcon,
                    tag: 'soManyNotification'
                };
                alert(theTitle+',' +theBody + '2');
                var n = new Notification(theTitle, option);
            }

            // Otherwise, we can fallback to a regular modal alert
            else {
                alert("Have some message, but you not enable it!!");
            }
        });
    }

    // If the user refuses to get notified
    else {
        // We can fallback to a regular modal alert
        //alert("Have some message, but you not enable it!!");
        var option = {
            body: theBody,
            //icon:theIcon,
            tag: 'soManyNotification'
        };
        alert(theTitle+',' +theBody);
        /*n = new Notification(theTitle, option);*/
    }
}
