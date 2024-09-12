// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CharacterList from './CharacterList'; // Adjust path as needed
import CharacterForm from './CharacterForm'; // Adjust path as needed

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CharacterList />} />
        <Route path="/edit/:id" element={<CharacterForm />} />
        <Route path="/create" element={<CharacterForm />} />
      </Routes>
    </Router>
  );
}

export default App;

