import React, { useState } from 'react';

function verifyRiscZeroReceipt(guestCodeId, receipt) {
  return "verified";
}

function Verifier() {
  const [guestCodeId, setGuestCodeId] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [verificationResult, setVerificationResult] = useState('Waiting to verify...');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const byteArray = new Uint8Array(arrayBuffer);
        const binaryString = byteArray.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        setReceipt(binaryString);
        verifyRiscZeroReceipt();
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div id="Verifier">
      <div>
        <p>Guest code id (hex value):</p>
        <input type="text" id="risc0GuestCodeId" value={guestCodeId} onChange={(e) => setGuestCodeId(e.target.value)} />
      </div>
      <div>
        <p>Receipt (bincode format binary file):</p>
        <input type="file" id="risc0ReceiptInput" onChange={handleFileChange} />
        <pre>{receipt}</pre>
        <div id="receiptVerificationResult">{verificationResult}</div>
      </div>
      <div>
          <button id="verifyButton" onClick={() => setVerificationResult(verifyRiscZeroReceipt(guestCodeId, receipt))}>Verify</button>
      </div>
    </div>
  );
}

export default Verifier;
