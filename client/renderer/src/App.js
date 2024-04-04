import logo from './logo.svg';
import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client"
import axios from 'axios';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomePage from './components/HomePage';
import MoviePage from './components/MoviePage';
function App() {


  const [chunkMap, setChunkMap] = useState(new Map());
  const [videoIdToDownlaod, setVideoIdToDownlaod] = useState("");
  const [moviesList, setMoviesList] = useState();


  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  const dataChannel = useRef();


  useEffect(() => {
    socketRef.current = io.connect("http://10.61.118.201:9000");
    socketRef.current.on("connect", () => {
      console.log("socket id", socketRef.current.id)
    })
    socketRef.current.emit("join")
    socketRef.current.on("offer", handleOffer)
    socketRef.current.on("answer", handleAnswer)
    socketRef.current.on("ice-candidate", handleCandidate)
    socketRef.current.on("sendChunks", handleChunkRequest)
  }, [])

  function handleChunkRequest(data) {
    console.log("requested data for chunk", data)
    let chunk;
    chunkMap.get(data.fileID).forEach(chunkInMap => { if (chunkInMap.id === data.chunkID) { chunk = chunkInMap } })
    if (chunk) {
      const response = {
        chunk: chunk,
        videoID: data.videoID
      }
      console.log("chunk found")
      const channel = callUser(data.target)
      channel.onopen = () => {
        channel.send(JSON.stringify(response))
        console.log("chunk sent")
      }
    } else {
      console.log("not found");
    }
  }

  function CreateRTCPeerConnection(userID) {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          url: 'turn:turn.bistri.com:80',
          credential: 'homeo',
          username: 'homeo'
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
      if (videoIdToDownlaod.length > 0) {
        try {
          if (chunkMap.get(videoIdToDownlaod).length === 10){

            console.log("downloading")
            const videoData={
              videoID:videoIdToDownlaod,
              chunkData:chunkMap.get(videoIdToDownlaod)
            }
            window.ipcRenderer.send("chunk_share", videoData)
          }
            //send to electron
        
        } catch (error) {
          console.error(error)
        }
      }

      console.log(a.data)
      const chunkToappendId = a.data.chunkID
      let lowerIndex = chunkMap.get(a.data.videoID)[0].chunkID
      chunkMap.get(a.data.videoID).forEach(chunk => {
        if (chunk.id < chunkToappendId) {
          lowerIndex = chunk.id
        }
      });
      const newChunkArray = [...a.data.videoID.slice(0, lowerIndex), a.data.chunk, ...a.data.videoId.slice(lowerIndex)]
      chunkMap.set(a.data.videoID,newChunkArray) 
      console.log("data received", a.data)
    }

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
  };

  function handleCandidate(incoming) {
    const candidate = new RTCIceCandidate(incoming);
    peerRef.current.addIceCandidate(candidate).catch(e => console.log(e))
  }

  function requestPacket(chunkId, videoID) {
    const payload = {
      target: socketRef.current.id,
      chunkId: chunkId,
      videoID: videoID
    }
    console.log("requesting packet", payload)
    socketRef.current.emit("getChunk", payload)
  }
  return (

    <>
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={
              <HomePage
                chunkMap={chunkMap}
                setChunkMap={setChunkMap}
                moviesList={moviesList}
                setMoviesList={setMoviesList}
              />
            }
          />
          <Route
            path='/movie/:videoID'
            element={
              <MoviePage
                chunkMap={chunkMap}
                setChunkMap={setChunkMap}
                requestPacket={requestPacket}
                socketRef={socketRef}
                moviesList={moviesList}
                videoIdToDownlaod={videoIdToDownlaod}
                setVideoIdToDownlaod={setVideoIdToDownlaod}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  )


}

//   return (
//     <div className="App">
//       <div className="SearchCont">
//             <input type="text" className="searchInput"/>
//             <button id="getMoviesBtn" className="btn">Search</button>
//         </div>
//         <div className="movielist" id="movieListCont">
//             {moviesListDummy.map(movie=>{
//               return (<div className='movieitem'>
//               <div className="group1"><div>{movie.id+1}</div>
//               <div className="movieName">{movie.title}</div></div>
//               <div>
//                 Watch
//               </div>
//               </div>)
//             })}
//         </div>
// <input value={search} onChange={(e)=>{setSearch(e.target.value)}}></input>
//       <h1>{socketRef.current?.id}</h1>
//       <ul>
//         {Array.from({ length: 10 }, (_, i) => (
//           <li key={i}>
//             <button onClick={() => requestPacket(i)}>Packet {i}</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );


export default App;
