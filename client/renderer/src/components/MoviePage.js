import { useParams } from 'react-router-dom'
import '../App.css';
import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client"
import axios from 'axios';
import { BrowserRouter, HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function MoviePage({ chunkMap, setChunkMap, requestPacket, socketRef, moviesList, videoIdToDownlaod, setVideoIdToDownlaod }) {
    const { videoID } = useParams();
    const navigate = useNavigate()
    useEffect(() => {
        setChunkMap(new Map())
        setVideoIdToDownlaod(videoID)
    }, [])
    useEffect(() => {
        console.log(chunkMap);

    }, [chunkMap])
    const handleDownload = async () => {
        console.log("downloading...")
        const response = await axios.get(`http://10.61.118.201:4000/download/${videoID}`)
        if(response.status==200){
            const chunkArray = response.data.data.files
            const videoData =  {
                videoID:chunkArray[0].FilesID,
                chunkData:chunkArray
            }
            //update chunk map
            const newChunkmap=new Map();

            newChunkmap.set(videoData.videoID,chunkArray)
            setChunkMap(newChunkmap)

            window.ipcRenderer.send("chunk_share",videoData)
            console.log("GOT ALL CHUNKS", response)
        }else{
            //ask the signalling server for packets
            const payload = {
                fileID:videoID,
                requesterID:socketRef.current.id
            }
            socketRef.current.send("getChunks",payload)
        }

    }
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

    let movie;
    moviesList.forEach(moviel => { if (moviel.ID == videoID) { movie = moviel } })
    return (
        <>
            <div className='mainMovieScreen'>
                <div className='navigationbar'>
                    <div className='icon' onClick={() => {
                        navigate('/')
                    }}>
                        <ArrowBackIcon />
                    </div>
                    <div className='navhead'>{movie.FileName}</div>
                </div>

                <div className='movieScreen'>
                    {/* Load Movie here */}
                    <div>Length:{movie.Length}</div>
                    <div>ChunkSize:{movie.ChunkSize}</div>
                    <div>ID:{movie.ID}</div>
                    <div className='downloadbtn'>
                        <button className="btn " onClick={handleDownload}>Download</button>
                    </div>
                </div>
            </div>
            {/* <h1>{socketRef.current?.id}</h1>
            <ul>
                {Array.from({ length: 10 }, (_, i) => (
                    <li key={i}>
                        <button onClick={() => requestPacket(i, videoID)}>Packet {i}</button>
                    </li>
                ))}
            </ul> */}
        </>
    )

}

export default MoviePage