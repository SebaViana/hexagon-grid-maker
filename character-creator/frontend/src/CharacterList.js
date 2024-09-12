// CharacterList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3000/api/personajes';

const CharacterList = () => {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await axios.get(API_URL);
        setCharacters(response.data);
      } catch (error) {
        console.error('Error fetching characters', error);
      }
    };

    fetchCharacters();
  }, []);

  const handleDelete = async (id) => {
    // Confirm the delete action
    if (window.confirm('Are you sure you want to delete this character?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setCharacters(characters.filter(character => character.id !== id));
        alert('Character deleted successfully');
      } catch (error) {
        console.error('Error deleting character', error);
        alert('Error deleting character');
      }
    }
  };

  return (
    <div>
      <h1>Character List</h1>
      <ul>
        {characters.map(character => (
          <li key={character.id}>
            <p>{character.name}</p>
            <button onClick={() => handleDelete(character.id)}>Delete</button>
            <Link to={`/edit/${character.id}`}>
              <button>Edit</button>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/create">Create New Character</Link>
    </div>
  );
};

export default CharacterList;

