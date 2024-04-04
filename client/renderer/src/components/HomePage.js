import '../App.css';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BrowserRouter, HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
function HomePage({ chunkMap, setChunkMap, moviesList, setMoviesList }) {
    const navigate = useNavigate()
    const [search, setSearch] = useState("")

    useEffect(() => {
        const newChunkMap = new Map(chunkMap)
        newChunkMap.set("Movie1", [
            { id: 1, chunk: "chunk1" },
            { id: 2, chunk: "chunk2" },
            { id: 3, chunk: "chunk3" }
        ])
        newChunkMap.set("Movie2", [
            { id: 4, chunk: "chunk1" },
            { id: 5, chunk: "chunk2" },
            { id: 6, chunk: "chunk3" }
        ],)
        setChunkMap(newChunkMap)
    }, [])
    useEffect(() => {
        // window.ipcRenderer.send("chunk_share", chunkMap.get("Movie1"))
        console.log(chunkMap);
    }, [chunkMap])

    const [moviesListToRender, setMoviesListToRender] = useState([]);
    // const [movieToShow, setMovieToShow] = useState(null);
    // const [movieScreen, setMovieScreen] = useState(movieToShow !== null);
    const [searchText, setSearchText] = useState("");

    const getMoviesFromApi = async () => {
        await axios
            .get('http://10.61.118.201:4000/getAllFiles')
            .then((response) => response.data)
            .then((data) => {
                console.log("got data", data, data.data['files'])
                return data.data.files
            }).then((movies) => {
                console.log(movies)
                setMoviesList([...movies]);
            })
            .catch((e) => console.error(e));

        {/**
            ID:
            length:
            chunkSize://the total size of file
            uploadDate:
            FileName:
        */}
    };
    useEffect(() => {
        getMoviesFromApi();
        // setMoviesList(moviesList)
    }, [])
    useEffect(() => {
        setMoviesListToRender(moviesList)
    }, [moviesList])
    useEffect(() => {
        if (searchText.length > 0) {
            const movielist = moviesList.filter(movie => movie.title.includes(searchText))
            setMoviesListToRender(movielist)
        } else if (searchText.length == 0) {
            setMoviesListToRender(moviesList)
        }
    }, [searchText])



    return (
        <>
            <div className="indexCont">
                <div className="SearchCont">
                    <input type="text" className="searchInput" onChange={(e) => { setSearchText(e.target.value) }} />
                    <button id="getMoviesBtn" className="btn">
                        Search
                    </button>
                </div>
                <div className="movielist" id="movieListCont">
                    {moviesListToRender ? moviesListToRender.map((movie, id) => {
                        return (
                            <div className="movieitem">
                                <div className="group1">
                                    <div>{id + 1}.</div>
                                    <div className="movieName">{movie.FileName}</div>
                                </div>
                                <div
                                    className="iconView"
                                    onClick={() => {
                                        navigate(`/movie/${movie.ID}`)

                                    }}
                                >
                                    <VisibilityIcon />
                                </div>
                            </div>
                        );
                    }) : <><div>No movie found</div></>}
                </div>

            </div>

        </>
    );
}

export default HomePage