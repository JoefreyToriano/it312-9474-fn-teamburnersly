document.addEventListener('DOMContentLoaded', function() {
    const videoPlayer = document.getElementById('video-player');
    const captionsTrack = videoPlayer.querySelector('track');

    // Function to get stream URL and captions URL from Owncast API
    function fetchStreamData() {
        fetch('https://your-owncast-server.com/api/endpoint')
            .then(response => response.json())
            .then(data => {
                const streamUrl = data.url; // Adjust according to API response
                const captionsUrl = data.captionsUrl; // Replace with actual property name

                videoPlayer.src = streamUrl;
                captionsTrack.src = captionsUrl; // Set captions URL
                videoPlayer.load(); // Reload video and track elements
                videoPlayer.play();
            })
            .catch(error => console.error('Error fetching stream data:', error));
    }

    fetchStreamData();
    setInterval(fetchStreamData, 60000); // Refresh every 60 seconds
});