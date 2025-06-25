import React from 'react';
import { Outlet } from '@tanstack/router';

const App: React.FC = () => {
  return (
    <div>
      <h1>MatSci YAMZ (Vite)</h1>
      <Outlet />
    </div>
  );
};

export default App;
