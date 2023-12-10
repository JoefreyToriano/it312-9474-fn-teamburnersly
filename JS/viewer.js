document.addEventListener('DOMContentLoaded', function() {
    const videoPlayer = document.getElementById('video-player');
    const captionsTrack = videoPlayer.querySelector('track');

    function fetchStreamData() {
        fetch('END POINT NATINNNN')
            .then(response => response.json())
            .then(data => {
                videoPlayer.src = data.url;
                captionsTrack.src = data.captionsUrl;
                videoPlayer.load();
                videoPlayer.play();
            })
            .catch(error => {
                console.error('Error fetching stream data:', error);
                alert('Error loading video. Please try again later.');
            });
    }

    fetchStreamData();
    setInterval(fetchStreamData, 60000); // Refresh every 60 seconds
});



