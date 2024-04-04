import logo from './logo.svg';
import './App.css';
import React, { useEffect, useRef } from 'react';
import io from "socket.io-client"

function App() {

  const packetMap = [
    {
      id: 0,
      data: "Hello"
    },
    {
      id: 1,
      data: "World"
    },
    {
      id: 3,
      data: "a"
    },
    {
      id: 4,
      data: "packet"
    },
    {
      id: 7,
      data: "packet"
    },
    {
      id: 8,
      data: "I am"
    },
    {
      id: 9,
      data: "a"
    },
  ]

  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  const dataChannel = useRef();


  useEffect(() => {
    socketRef.current = io.connect("http://localhost:9000");
    socketRef.current.on("connect", () => {
      console.log("socket id", socketRef.current.id)
    })
    socketRef.current.emit("join")
    socketRef.current.on("offer", handleOffer)
    socketRef.current.on("answer", handleAnswer)
    socketRef.current.on("ice-candidate", handleCandidate)
    socketRef.current.on("sendChunk", handleChunkRequest)
  }, [])

  function handleChunkRequest(data) {
    console.log("requested data for chunk", data.chunkId)
    const chunk = packetMap.find(e => e.id === data.chunkId)
    if (chunk) {
      console.log("chunk found")
      const channel = callUser(data.target)
      channel.onopen = ()=>{
        channel.send(JSON.stringify(chunk))
        console.log("chunk sent")
      }
    } else {
      console.log("chunk not found")
    }
  }

  function CreateRTCPeerConnection(userID) {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: "turn:localhost:3478",
          username: "myTurnServer",
          credential: "1234"
        }
      ]
    });

    peer.onicecandidate = handleICECandidateEvent;
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
    otherUser.current = userID;
    peerRef.current = CreateRTCPeerConnection(userID);
    dataChannel.current = peerRef.current.createDataChannel("channel");
    dataChannel.current.onopen = () => { console.log("data channel open") }
    dataChannel.current.onmessage = a => {
      //TODO:store this data locally
      console.log("data received", a.data)
    };
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
    return dataChannel.current;
  }

  function handleCandidate(incoming) {
    const candidate = new RTCIceCandidate(incoming);
    peerRef.current.addIceCandidate(candidate).catch(e => console.log(e))
  }

  function requestPacket(chunkId) {
    const payload = {
      target: socketRef.current.id,
      chunkId: chunkId
    }
    console.log("requesting packet", payload)
    socketRef.current.emit("getChunk", payload)
  }

  return (
    <div className="App">

      <h1>{socketRef.current?.id}</h1>
      <ul>
        {Array.from({ length: 10 }, (_, i) => (
          <li key={i}>
            <button onClick={() => requestPacket(i)}>Packet {i}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
