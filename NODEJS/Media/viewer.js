let remoteStream

const servers = {
    iceServers:[
        {
            urls:['stun.l.google.com:19302','stun2.l.google.com:19302']
        }
    ]
}

let createOffer = async()=>{
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()

    document.getElementById('liveVideo').srcObject = remoteStream

    peerConnection.ontrack = (event)=>{
        event.stream[0].getTracks().forEach((track)=>{
            remoteStream.addTrack()
        })
    }

    peerConnection.onicecandidate = async(event)=>{
        if(event.candidate){
            
        }
    }

    let offer = await peerConnection.createOffer()

    await peerConnection.setLocalDescription(offer)

    

    console.log('Offer:',offer)
}