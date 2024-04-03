import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function App() {
  const moviesListDummy = [
    {
      id: 0,
      title: 'movie1',
      movielink: 'movie1',
    },
    {
      id: 1,
      title: 'movie2',
      movielink: 'linkhere2',
    },
    {
      id: 2,
      title: 'movie3',
      movielink: 'linkhere3',
    },
    {
      id: 3,
      title: 'movie4',
      movielink: 'linkhere4',
    },
  ];  
  const [moviesList, setMoviesList] = useState([]);
  const [moviesListToRender, setMoviesListToRender] = useState([...moviesListDummy]);

  const [movieToShow, setMovieToShow] = useState(null);
  const [movieScreen, setMovieScreen] = useState(movieToShow !== null);
  const [searchText,setSearchText]=useState("");

 
  useEffect(()=>{
    if(searchText.length>0){
      const movielist=moviesListDummy.filter(movie=>movie.title.includes(searchText))
      setMoviesListToRender(movielist)
    }else if(searchText.length==0){
      setMoviesListToRender(moviesListDummy)
    }
  },[searchText])
  const MainMovieScreen = ({ movieid }) => {
    const movie = moviesListDummy.find(movie => movie.id == movieToShow)
    return (
      <>
        <div className='mainMovieScreen'>
          <div className='navigationbar'>
            <div className='icon' onClick={()=>{
              setMovieToShow(null);
              setMovieScreen(false)
            }}>
              <ArrowBackIcon/>
            </div>
            <div className='navhead'>{movie.title}</div>
          </div>

          <div className='movieScreen'>
            {/* Load Movie here */}
          </div>
        </div>
      </>
    )
  }

  const getMoviesFromApi = async () => {
    await axios
      .get('<api_url>')
      .then((response) => response.data)
      .then((data) => {
        setMoviesList([...moviesList, data]);
      })
      .catch((e) => console.error(e));
  };
  return movieScreen ? (
    <MainMovieScreen movieid={movieToShow} />
  ) : (
    <div className="indexCont">
      <div className="SearchCont">
        <input type="text" className="searchInput" onChange={(e)=>{setSearchText(e.target.value)}}/>
        <button id="getMoviesBtn" className="btn">
          Search
        </button>
      </div>
      <div className="movielist" id="movieListCont">
        {moviesListToRender.length>0 ? moviesListToRender.map((movie) => {
          return (
            <div className="movieitem">
              <div className="group1">
                <div>{movie.id + 1}.</div>
                <div className="movieName">{movie.title}</div>
              </div>
              <div
                className="iconView"
                onClick={() => {
                  console.log('movieloading', movie);
                  setMovieToShow(movie.id);
                  setMovieScreen(true)

                }}
              >
                <VisibilityIcon />
              </div>
            </div>
          );
        }):<><div>No movie found</div></>}
      </div>
      
    </div>
  );
}

export default App;
