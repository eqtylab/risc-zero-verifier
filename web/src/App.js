import React, { useState } from 'react';
import './App.css';
import { Verifier } from "@eqty/risc-zero-verifier-react";

function App() {
  return (
    <div className="App">
      <Verifier
        enableJournalParser={true}
        // registryUrl="http://localhost:3000/registry.json"
        // ipfsGateway="http://localhost:8080/ipfs/"
      />
    </div>
  );
}

export default App;
