import { useParams } from 'react-router-dom'
import '../App.css';
import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client"
import axios from 'axios';
import { BrowserRouter, HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useChunkMapStore from '../store/chunkMapStore';

function MoviePage({ chunkMap, setChunkMap, requestPacket, socketRef, moviesList, videoIdToDownlaod, setVideoIdToDownlaod }) {
    const { videoID } = useParams();
    const navigate = useNavigate()
    useEffect(() => {
        // setChunkMap(new Map())
        setVideoIdToDownlaod(videoID)
    }, [])
    useEffect(() => {
        console.log(chunkMap);

    }, [])
    const chunkMapStore = useChunkMapStore()
    const handleDownload = async () => {
        console.log("downloading...")
        try{
            const response = await axios.get(`http://10.61.23.100:4000/download/${videoID}`)
            const chunkArray = response.data.data.files
            const videoData =  {
                videoID:chunkArray[0].FilesID,
                chunkData:chunkArray
            }
            //update chunk map
            const newChunkmap=new Map();

            newChunkmap.set(videoData.videoID,chunkArray)
            // chunkMapStore.setChunkMap(newChunkmap)
            chunkMap = newChunkmap
            console.log(chunkMap)
            // localStorage.setItem("chunkMap",JSON.stringify(newChunkmap))
            localStorage.myMap = JSON.stringify(Array.from(chunkMap.entries()));
            // setChunkMap(newChunkmap)

            window.ipcRenderer.send("chunk_share",videoData)
            console.log("GOT ALL CHUNKS", response)
        }catch(error){
            console.log("hitting signalling server",socketRef.current.id)
            const payload = {
                fileID:videoID,
                requesterID:socketRef.current.id
            }
            socketRef.current.emit("getChunks",payload)
        }

    }

    let movie;
    moviesList?.forEach(moviel => { if (moviel.ID == videoID) { movie = moviel } })
    return (
        <>
            <div className='mainMovieScreen'>
                <div className='navigationbar'>
                    <div className='icon' onClick={() => {
                        navigate('/')
                    }}>
                        <ArrowBackIcon />
                    </div>
                    <div className='navhead'>{movie?.FileName}</div>
                </div>

                <div className='movieScreen'>
                    {/* Load Movie here */}
                    <div>Length:{movie?.Length}</div>
                    <div>ChunkSize:{movie?.ChunkSize}</div>
                    <div>ID:{movie?.ID}</div>
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