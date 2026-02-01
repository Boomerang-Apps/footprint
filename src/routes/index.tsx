import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StyleList from '../pages/StyleList';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<StyleList />} />
      <Route path="/styles" element={<StyleList />} />
    </Routes>
  );
};

export default AppRoutes;
