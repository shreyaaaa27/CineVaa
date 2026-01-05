import React, {  useEffect, useState } from 'react';
import Spinner from './components/spinner.jsx';
import Search from './components/Search.jsx';
import MovieCard from './components/MovieCard.jsx';
import { updateSearchCount,getTrendingMovies } from './appwrite.js';

const API_BASE_URL ='https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS={
  method: 'GET',
  headers:{
    accept: 'application/json',
    Authorization : `Bearer ${API_KEY}`,
  },
};

const App = () => {
   const [searchTerm, setSearchTerm] = useState('');

   const [movieList, setmovieList] = useState([]);

   const [errorMessage, setErrorMessage] = useState('');

   const [isLoading, setisLoading] = useState(false);
   
   const [TrendingMovies, setTrendingMovies] = useState([]);
   

   //Debounce the search term to prevent making too many API requests 
   // by waiting for the user to stop typing for 500ms
   //useDebounce(()=> setDebouncedSearchTerm(searchTerm),500,[searchTerm])

   const fetchMovies = async(query='') =>{
    setisLoading(true);
    setErrorMessage('');
    try{
      const endpoint = query
      ?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error("Failed to fetch movies");
      }
      const data = await response.json();

      if(data.response === "False"){
        setErrorMessage(data.Error || "Failed to fetch movies");
        setmovieList([]);
        return;
      }
      setmovieList(data.results || []);
      console.log( "Movies data:",data);


    if(query && data.results.length>0){
      await updateSearchCount(query,data.results[0]);
    }

    }catch(error){
      console.error(`Error fetching movies :${error}`);
      setErrorMessage('Error fetching movies.Please try again later.');
    }
    finally{
     setisLoading(false); 
    }
  }

  const loadTrendingMovies =async()=>{
    try{
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    }
    catch(error){
      console.error(`Error fetching trending movies:${error}`);
    }
  }

   useEffect(() =>{
       fetchMovies(searchTerm);
   }, [searchTerm]);

   useEffect(() =>{
    loadTrendingMovies();
   },[]);

  return(
    <main className ="app-bg">

    <div className ="pattern "/>
    <div className ="wrapper">
      <header>
        <img src= "/hero-img.png" alt ="Hero Banner"/>
        <h1> Find <span className ="text-gradient" >Movies</span> which you'll watch without the Hassle.</h1>
      
     
    <Search searchTerm ={searchTerm} setSearchTerm={setSearchTerm} />
    </header>

    { TrendingMovies.length >0 && (
      <section className='trending'>
        <h2>Trending Movies</h2>

      <ul>
        {TrendingMovies.map((movie,index)=>(
          <li key={movie.id}>
            <p>{index +1}</p>
            <img src ={movie.poster_url} alt ={movie.title} />
          </li>
        )
        )}
      </ul>


      </section>
    )}
    <section className ="all-movies">
      <h2 > All Movies</h2>

      { isLoading ?(
        <Spinner />
      ):
      errorMessage ?(
        <p className ="text-red-500">{errorMessage}</p>
      ):(
        <ul>
          {movieList.map((movie) =>(
            <MovieCard key ={movie.id} movie= {movie} />
          ))}
        </ul>
      )
    }

    </section>
    <h1 className ="text-white">{ searchTerm }</h1>
    </div>
    </main>
  )
  
}

export default App