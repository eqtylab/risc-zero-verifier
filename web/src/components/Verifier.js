import React, { useState } from 'react';
import * as verifier from "@eqtylab/risc-zero-verifier";

async function verifyRiscZeroReceipt(guestCodeId, receiptJson) {
  if (!guestCodeId) {
    return "Please enter a guest code id.";
  }
  
  if (!receiptJson) {
    return "Please provide a receipt file.";
  }
  
  try {
    let result = await verifier.verify_json_receipt(guestCodeId, receiptJson);
    if (result.verified === true) {
      return "verified";
    } else {
      return "not verified: ", result.error;
    }
  } catch (error) {
    return "Error: " + error;
  }
}


function Verifier() {
  const [guestCodeId, setGuestCodeId] = useState('');
  const [receiptJson, setReceiptJson] = useState('');
  const [verificationResult, setVerificationResult] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;

        // Try parsing as JSON
        let receiptJson;
        try {
          receiptJson = JSON.parse(text);
          setReceiptJson(JSON.stringify(receiptJson, null, 2));
          console.log("Receipt JSON: ", receiptJson);
        } catch (error) {
          // Try to convert from binary, expecting bincode format, if JSON parsing fails
          const fallbackReader = new FileReader();
          fallbackReader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const byteArray = new Uint8Array(arrayBuffer);
            receiptJson = await verifier.convert_binary_receipt_to_json(byteArray);
            setReceiptJson(receiptJson);
            console.log("Receipt: ", byteArray);
            console.log("Receipt JSON: ", receiptJson);
          };
          fallbackReader.readAsArrayBuffer(file);
        }
      };

      reader.readAsText(file);
    }
  };

  return (
    <div id="Verifier">
      <div>
        <label for="risc0GuestCodeId">Guest code id (hex value):</label>
        <input type="text" id="risc0GuestCodeId" value={guestCodeId} onChange={(e) => setGuestCodeId(e.target.value)} />
      </div>
      <div>
        <p>Upload a receipt file as JSON or binary (bincode format), or paste it as JSON into the form field.</p>
        <div>
          <label for="risc0ReceiptFileInput">Receipt (bincode format binary file or JSON):</label> 
          <input type="file" id="risc0ReceiptFileInput" onChange={handleFileChange} />
        </div>
        <div>
          <label for="risc0ReceiptJson">Receipt JSON:</label>
          <textarea id="risc0ReceiptJson" value={receiptJson} onChange={(event) => {setReceiptJson(event.target.value);}}/>
        </div>
      </div>
      <div>
        <button id="verifyButton" onClick={async () => setVerificationResult(await verifyRiscZeroReceipt(guestCodeId, receiptJson))}>Verify</button>
      </div>
      <div id="receiptVerificationResult">{verificationResult}</div>
    </div>
  );
}

export default Verifier;
