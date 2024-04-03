import logo from './logo.svg';
import './App.css';
import React, { useEffect,useRef } from 'react';
import io from "socket.io-client"

function App() {


  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  const dataChannel = useRef();

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:9000");
    socketRef.current.emit("join")
    socketRef.current.on("other-user", userId => {
      console.log("other user", userId)
      callUser(userId);
      otherUser.current = userId;
    });
    socketRef.current.on("user joined",userID=>{
      otherUser.current = userID
    })
    socketRef.current.on("offer", handleOffer)
    socketRef.current.on("answer", handleAnswer)
    socketRef.current.on("ice-candidate", handleCandidate)

    socketRef.current.on("sendChunk",data=>{
      console.log("requested data for chunk",data.chunkId)
      //find locally if the chunk exists or not
      //if it exists send it
    })
  }, [])

  function CreateRTCPeerConnection(userID) {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: 'turn:turn.bistri.com:80',
          credential: 'homeo',
          username: 'homeo'
        }
      ]
    });

    peer.onicecandidate = handleICECandidateEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);
    return peer;
  }

  function handleOffer(incoming) {
    peerRef.current = CreateRTCPeerConnection();
    peerRef.current.ondatachannel = e => {
      dataChannel.current = e.channel;
      dataChannel.current.onmessage = a => { console.log(a.data) };
      console.log("Connection established")
    }
    const desc = new RTCSessionDescription(incoming.sdp)
    peerRef.current.setRemoteDescription(desc).then(() => {
      return peerRef.current.createAnswer()
    }).then(answer => {
      return peerRef.current.setLocalDescription(answer)
    }).then(() => {
      const payload = {
        target: incoming.caller,
        caller: socketRef.current.id,
        sdp: peerRef.current.localDescription
      }
      socketRef.current.emit("answer", payload)
    })
  }

  function handleNegotiationNeededEvent (userID){
    peerRef.current.createOffer().then(offer=>{
      return peerRef.current.setLocalDescription(offer)
    })
    .then(()=>{
      const payload = {
        target:userID,
        caller:socketRef.current.id,
        sdp:peerRef.current.localDescription
      }
      socketRef.current.emit("offer",payload)
    })
  }

  function handleICECandidateEvent(e) {
    console.log("new ICE candidate , SDP", JSON.stringify(peerRef.current.localDescription))
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate
      }
      socketRef.current.emit("ice-candidate", payload)
    }
  }

  function handleAnswer(message) {
    const desc = new RTCSessionDescription(message.sdp)
    peerRef.current.setRemoteDescription(desc).catch(e => console.log("ERROR HANDLING ANSWER", e))
  }
  function callUser(userID) {
    peerRef.current = CreateRTCPeerConnection(userID);
    dataChannel.current = peerRef.current.createDataChannel("channel");
    dataChannel.current.onopen = () => { console.log("data channel open") }
    dataChannel.current.onmessage = a => { console.log("Message recieved", a.data) };
    dataChannel.current.onclose = () => console.log("data channel closed")
    peerRef.current.createOffer().then(offer => {
      return peerRef.current.setLocalDescription(offer);
    }).then(() => {
      const payload = {
        target: userID,
        caller: socketRef.current.id,
        sdp: peerRef.current.localDescription
      }
      socketRef.current.emit("offer", payload)
    })
  }

  function handleCandidate(incoming){
    const candidate = new RTCIceCandidate(incoming);
    peerRef.current.addIceCandidate(candidate).catch(e=>console.log(e))
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
