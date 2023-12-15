window.onload = function(){
    
    document.getElementById("start").onclick = function(){
        navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(stream=>{
            
        })
    }
    
    
        
        
    document.getElementById("stop").onclick = function(){
        mediaRecorder.stop()
    }
}




