import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';

function App() {
  const [moviesList,setMoviesList]=useState([])
  const moviesListDummy=[
      {
          id:0,
          title:"movie1",
          movielink:"movie1"
      },
      {
          id:1,
          title:"movie2",
          movielink:"linkhere2"
      },
      {
          id:2,
          title:"movie3",
          movielink:"linkhere3"
      },
      {
          id:3,
          title:"movie4",
          movielink:"linkhere4"
      }
  ]
  
  const getMoviesFromApi = async()=>{
      await axios.get("<api_url>").then((response)=>response.data).then((data)=>{
      setMoviesList([...moviesList,data])
      }).catch(e=>console.error(e));
  }
  
    return (
      <div className="indexCont">
  
          <div className="SearchCont">
              <input type="text" className="searchInput"/>
              <button id="getMoviesBtn" className="btn">Search</button>
          </div>
          <div className="movielist" id="movieListCont">
              {moviesListDummy.map(movie=>{
                return (<div className='movieitem'>
                <div className="group1"><div>{movie.id+1}.</div>
                <div className="movieName">{movie.title}</div></div>
                <div className='iconView'>
                 <VisibilityIcon/>
                </div>
                </div>)
              })}
          </div>
      </div>
    //   will add video frame and back button here 
    );
  }
  

export default App;
