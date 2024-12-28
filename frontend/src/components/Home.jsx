import { useState, useEffect } from 'react';
import '../styles/home.css';

function Home() {
  const [token, setToken] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [audio, setAudio] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('');

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'artist', label: 'Artist' },
    { id: 'date', label: 'Date' },
    { id: 'genre', label: 'Genre' },
    { id: 'bollywood', label: 'Bollywood' }
  ];

  useEffect(() => {
    // Get token
    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=4df1d8e2071d4a38b80e9ee95f80254d&client_secret=42a87269457e415e8f1c6bcc98dc7ffb'
    })
    .then(res => res.json())
    .then(data => setToken(data.access_token))
    .catch(err => console.error(err));
  }, []);

  const searchSpotify = async () => {
    let searchQuery = searchInput;
    
    // Modify search query based on filters
    switch(activeFilter) {
      case 'artist':
        searchQuery = `artist:${searchInput}`;
        break;
      case 'bollywood':
        searchQuery = `${searchInput} bollywood`;
        break;
      case 'genre':
        searchQuery = `genre:${searchInput}`;
        break;
      default:
        
        break;
    }

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${searchQuery}&type=track,artist&market=IN`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const data = await response.json();
    let results = data.tracks?.items || [];

    // Sort results if needed
    if (sortBy === 'date') {
      results = results.sort((a, b) => {
        return new Date(b.album.release_date) - new Date(a.album.release_date);
      });
    }

    setSearchResults(results);
  };

  const handlePlay = (track) => {
    if (audio) {
      audio.pause();
    }
    if (currentTrack?.id === track.id && isPlaying) {
      setIsPlaying(false);
    } else {
      const newAudio = new Audio(track.preview_url);
      setAudio(newAudio);
      setCurrentTrack(track);
      setIsPlaying(true);
      newAudio.play();
    }
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  return (
    <div className="spotify-container">
      <div className="search-section">
        <div className="search-controls">
          <select 
            className="filter-dropdown"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            {filterOptions.map(filter => (
              <option key={filter.id} value={filter.id}>
                {filter.label}
              </option>
            ))}
          </select>
          
          <div className="search-input-group">
            <input 
              type="text"
              placeholder={`Search ${activeFilter === 'all' ? 'anything' : activeFilter}...`}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button onClick={searchSpotify}>Search</button>
          </div>
          
          {activeFilter === 'date' && (
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="">Sort by</option>
              <option value="date">Release Date</option>
            </select>
          )}
        </div>
      </div>
      
      <div className="results-section">
        {searchResults.map(track => (
          <div key={track.id} className="track-card">
            <div className="track-image-container">
              <img src={track.album?.images[0]?.url} alt={track.name} />
              <button 
                className={`play-pause-btn ${currentTrack?.id === track.id ? 'playing' : ''}`}
                onClick={() => handlePlay(track)}
              >
                {currentTrack?.id === track.id && isPlaying ? '⏸️' : '▶️'}
              </button>
            </div>
            <h3>{track.name}</h3>
            <p>{track.artists[0].name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;