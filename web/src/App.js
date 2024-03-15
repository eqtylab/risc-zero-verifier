import React, { useState } from "react";
import "./App.css";
import { Verifier } from "@eqty/risc-zero-verifier-react";
import cx from "classnames";

const VERIFICATION = {
  NONE: "none",
  VERIFIED: "verified",
  UNVERIFIED: "un-verified",
};

function App() {
  const [isVerified, setIsVerified] = useState(VERIFICATION.NONE);
  const onVerifierStatus = (result) => {
    if (result) {
      console.log("🚀 ~ onVerifierStatus ~ result:", result.verified);

      setIsVerified(
        result.verified ? VERIFICATION.VERIFIED : VERIFICATION.UNVERIFIED
      );
    }
  };

  const classList = cx("App", {
    "is-verified": isVerified === VERIFICATION.VERIFIED,
    "is-unverified": isVerified === VERIFICATION.UNVERIFIED,
  });

  return (
    <div className={classList}>
      <div className="header">
        <h1>RISC Zero Verifier</h1>
        <p>
          This is a verifier for{" "}
          <a href="https://dev.risczero.com/api/zkvm/">RISC Zero zkVM</a>{" "}
          execution receipts.
        </p>
      </div>
      <Verifier
        enableJournalParser={true}
        onStatus={onVerifierStatus}
        // registryUrl="http://localhost:3000/registry.json"
        // ipfsGateway="http://localhost:8080"
      />
      <div className="info">
        <p>
          This verifier is developed by{" "}
          <a href="https://www.eqtylab.io/">EQTY Lab</a> and the code is{" "}
          <a href="https://github.com/eqtylab/risc-zero-verifier">
            available on GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default App;
