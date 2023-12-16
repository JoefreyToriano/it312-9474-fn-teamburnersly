let localStream

const servers = {
    iceServers:[
        {
            urls:['stun.l.google.com:19302','stun2.l.google.com:19302']
        }
    ]
}

let init = async()=>{
    peerConnection = new RTCPeerConnection(servers)

    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio: true})
    document.getElementById("liveVideo").srcObject = localStream
    localStream.getTracks().forEach((track)=>{
        peerConnection.addTrack(track, localStream)
    })
}