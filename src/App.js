import * as React from 'react';
import axios from 'axios';
import './App.css'; 

const API_ENDPOINT = 'https://api.punkapi.com/v2/beers';

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
      localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const beerReducer = (state, action) => {
  switch (action.type) {

    case 'BEER_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    
      case 'BEER_FETCH_SUCCESS':
        return{
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };

      case 'BEER_FETCH_FAILURE':
        return{
          ...state,
          isloading: false,
          isError: true,
        };

    default:
      throw new Error();
  }

};

const App = ()  => {

  const [searchBeer, setSearchBeer] = useSemiPersistentState('search', '');

  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchBeer}`);

  const [beers, dispatchBeers] = React.useReducer(beerReducer,
    {data: [], isLoading: false, isError: false}
  );
  
  const handleBeers = React.useCallback(async () => {
    dispatchBeers({type: 'BEER_FETCH_INIT'});
    try{
      const result = await axios.get(url);
      dispatchBeers({
        type: 'BEER_FETCH_SUCCESS',
        payload: result.data,
      });
    }
    catch{
      dispatchBeers({type: 'BEER_FETCH_FAILURE'});
    }
  },[url]);

  React.useEffect(() =>{
    handleBeers();
  }, [handleBeers]);

  const handleBeerInput = (event) => {
    setSearchBeer(event.target.value);
  };

  const handleBeerSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchBeer}`);

    event.preventDefault();
  };

  return (
    <div className="container">
      <h1 className="headline-primary">Beer Catalog</h1>
      
      <SearchBeerForm 
        searchBeer={searchBeer} 
        onBeerInput={handleBeerInput} 
        onBeerSubmit={handleBeerSubmit} 
      />
      {beers.isError && <p>Something went wrong...</p>}
      {beers.isLoading ? (<p>Loading...</p>) : (<List list={beers.data} />)}
    </div>
  );
};

const SearchBeerForm = ({searchBeer, onBeerInput, onBeerSubmit}) => (
  <form onSubmit ={onBeerSubmit}>
    <InputWithLabel id="search" value={searchBeer} isFocused onInputChange={onBeerInput} >
      <strong>Search: </strong>
    </InputWithLabel>
    <button type="submit">
      Submit
    </button>
  </form>
);

const InputWithLabel = ({id, value, type ='text', isFocused, onInputChange, children}) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if(isFocused && inputRef.current){
      inputRef.current.focus();
    }
  }, [isFocused]);

  return(
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} />
    </>
  );
};

const List = ({list}) => (
  <ul >
    {list.map((item) => (
      <Item 
        key={item.id}
        item= {item}
      />
    ))}
  </ul>
);

const Item = ({item}) => (
<li style={{margin: '20px', border: '10px solid black' ,padding: '30px', listStyleType: 'none'}}>
  <span ><img src={item.image_url} alt="Beer" style={{height:'auto',width:'10%', display:'block', margin: '0 auto'}} /></span>
  <span style={{fontWeight: 'bold', display: 'block', textAlign:'center'}}>{item.name}</span>
  <span style={{fontStyle: 'italic', display: 'block', textAlign:'center'}}>"{item.tagline}"</span>
  <span stlye={{display: 'block', textAlign:'center'}}>{item.description}</span>
</li>
);

export default App;
