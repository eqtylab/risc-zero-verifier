import React, { useState } from 'react';
import './App.css';
import { Verifier } from "@eqty/risc-zero-verifier-react";

function App() {
  return (
    <div className="App">
      <Verifier
        enableJournalParser={true}
        ipfsGateway='https://ipfs.hypha.coop'
      />
    </div>
  );
}

export default App;
