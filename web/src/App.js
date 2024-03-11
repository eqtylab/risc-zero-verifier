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
      <div className="info">
        <p>This verifier is developed by <a href="https://www.eqtylab.io/">EQTY Lab</a> and the code is <a href="https://github.com/eqtylab/risc-zero-verifier">available on GitHub</a>.</p>
      </div>
    </div>
  );
}

export default App;
