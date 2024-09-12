// CharacterForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

const API_URL = 'http://localhost:3000/api/personajes';

const checkImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.width === 300 && img.height === 400);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

const CharacterForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [race, setRace] = useState('');
  const [character_class, setCharacter_class] = useState('');
  const [strength, setStrength] = useState(1);
  const [dexterity, setDexterity] = useState(1);
  const [intelligence, setIntelligence] = useState(1);
  const [luck, setLuck] = useState(1);
  const [image, setImage] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/jpeg, image/png',
    maxSize: 500000, // 500 KB
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      try {
        const isValidDimensions = await checkImageDimensions(file);
        if (isValidDimensions) {
          setImage(URL.createObjectURL(file));
        } else {
          alert('The image must be 300x400 pixels');
        }
      } catch (error) {
        alert('Error verifying image dimensions');
      }
    },
  });

  useEffect(() => {
    if (id) {
      // Fetch character data if in edit mode
      axios.get(`${API_URL}/${id}`)
        .then((response) => {
          const character = response.data;
          setName(character.name);
          setRace(character.race);
          setCharacter_class(character.character_class);
          setStrength(character.strength);
          setDexterity(character.dexterity);
          setIntelligence(character.intelligence);
          setLuck(character.luck);
          setImage(character.image ? URL.createObjectURL(new Blob([character.image])) : null);
          setEditMode(true);
        })
        .catch((error) => {
          console.error('Error fetching character data:', error);
          navigate('/');  // Redirect to home if character not found
        });
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('race', race);
    formData.append('character_class', character_class);
    formData.append('strength', strength);
    formData.append('dexterity', dexterity);
    formData.append('intelligence', intelligence);
    formData.append('luck', luck);
    formData.append('health', 100);
    if (image) {
      formData.append('image', image);
    }

    try {
      if (editMode) {
        await axios.put(`${API_URL}/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Character updated successfully');
      } else {
        await axios.post(API_URL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Character created successfully');
      }
      navigate('/');
    } catch (error) {
      alert('Error saving the character');
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div>
      <h1>{editMode ? 'Edit Character' : 'Create Character'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Character Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Race:</label>
          <select value={race} onChange={(e) => setRace(e.target.value)} required>
            <option value="">Select a race</option>
            <option value="human">Human</option>
            <option value="elf">Elf</option>
            <option value="dwarf">Dwarf</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <div>
          <label>Class:</label>
          <select value={character_class} onChange={(e) => setCharacter_class(e.target.value)} required>
            <option value="">Select a class</option>
            <option value="warrior">Warrior</option>
            <option value="mage">Mage</option>
            <option value="archer">Archer</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <div>
          <label>Strength:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Dexterity:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={dexterity}
            onChange={(e) => setDexterity(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Intelligence:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={intelligence}
            onChange={(e) => setIntelligence(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Luck:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={luck}
            onChange={(e) => setLuck(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Image:</label>
          <div {...getRootProps()} style={{ border: '1px solid #ccc', padding: '10px', cursor: 'pointer' }}>
            <input {...getInputProps()} />
            {image ? <img src={image} alt="Character" style={{ width: '300px', height: '400px' }} /> : 'Drag and drop an image here or click to select'}
          </div>
        </div>
        <button type="submit">{editMode ? 'Update Character' : 'Create Character'}</button>
        <button type="button" onClick={handleBack} style={{ marginLeft: '10px' }}>
          Back
        </button>
      </form>
    </div>
  );
};

export default CharacterForm;

