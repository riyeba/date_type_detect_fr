import React from "react";




import Sender from "./components/Sender";
import { Route, Routes } from "react-router";


function App() {
  return (
    <div >
    

      <Routes>
        <Route path="/" element={<Sender />} />
      </Routes>
      
    </div>
  );
}

export default App;
