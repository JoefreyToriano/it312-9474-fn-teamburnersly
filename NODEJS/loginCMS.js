$(document).ready(function() {
    $('.signin').hover(function() {}, function() {
        $(this).addClass('animateout');
        setTimeout(function() {
            $('.signin').removeClass('animateout');
        }, 750);
    });

    $('.signin').on('click', function() {
        $('.overlay').toggleClass('active');
        $('.signinform-field').removeClass('focus');
        $('input').val('');
        return false;
    });

    $('input').focus(function() {
        $(this).parent().addClass('focus');
    }).blur(function() {
        if ($(this).val() == '') {
            $(this).parent().removeClass('focus');
        }
        if ($('#fdEmail').val() != '' && $('#fdPassword').val() != '') {
            $('#btSubmit').addClass('active');
        } else {
            $('#btSubmit').removeClass('active');
        }
    });

    $('#btSubmit').on('click', function(event) {
        event.preventDefault();
        var email = $('#fdEmail').val();
        var password = $('#fdPassword').val();

        // Basic validation
        if (!email || !password) {
            alert('Please enter both email and password.');
            return false;
        }

        // Send a POST request to your server for validation
        fetch('/login-endpoint', { // Replace '/login-endpoint' with login endpoint natin
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, password: password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Handle successful login
                console.log('Login successful:', data);
                alert('Login successful!');
            } else {
                // Handle login failure
                console.error('Login failed:', data);
                alert('Login failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Login request failed:', error);
            alert('Login request failed: ' + error.message); 
        });

        return false;
    });

    $('#btCancel').on('click', function() {
        $('.overlay').removeClass('active');
        return false;
    });

    // YouTube Player API code
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;
    window.onYouTubePlayerAPIReady = function() {
        player = new YT.Player('video', {
            playerVars: { 'autoplay': 1, 'controls': 1, 'autohide': 1, 'wmode': 'opaque' },
            videoId: 'uktixvKQ',
            events: {
                'onReady': onPlayerReady
            }
        });
    };

    function onPlayerReady(event) {
        event.target.mute();
    }
});