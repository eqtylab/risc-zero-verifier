import React, { useState } from 'react';
import * as verifier from "@eqtylab/risc-zero-verifier";

const defaultText = {
  verifyButtonLabel: "Verify",
  instructions: "Upload a receipt file as JSON or binary (bincode format), or paste it as JSON into the form field.",
  fieldLabels: {
    guestCodeId: "Guest code id (hex value):",
    receiptFile: "Receipt (bincode format binary file or JSON):",
    receiptJson: "Receipt JSON:"
  },
  errors: {
    guestCodeIdMissing: "Please enter a guest code id.",
    receiptJsonMissing: "Please provide a receipt file."
  }
}

function Verifier({text = defaultText}) {
  const [guestCodeId, setGuestCodeId] = useState('');
  const [receiptBinary, setReceiptBinary] = useState('');
  const [receiptJson, setReceiptJson] = useState('');
  const [verificationResult, setVerificationResult] = useState('');

  async function verifyRiscZeroReceipt(guestCodeId, receiptJson) {
    if (!guestCodeId) {
      return text.errors.guestCodeIdMissing;
    }
    
    if (!receiptJson) {
      return text.errors.receiptJsonMissing;
    }
    
    try {
      let result = await verifier.verify_receipt_json(guestCodeId, receiptJson);
      if (result.verified === true) {
        return "verified";
      } else {
        return "not verified: ", result.error;
      }
    } catch (error) {
      return "Error: " + error;
    }
  }

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
            receiptJson = await verifier.binary_to_json(byteArray);
            setReceiptBinary(byteArray);
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
        <label htmlFor="risc0GuestCodeId">{text.fieldLabels.guestCodeId}</label>
        <input type="text" id="risc0GuestCodeId" value={guestCodeId} onChange={(e) => setGuestCodeId(e.target.value)} />
      </div>
      <div>
        <p>{text.instructions}</p>
        <div>
          <label htmlFor="risc0ReceiptFileInput">{text.fieldLabels.receiptFile}</label> 
          <input type="file" id="risc0ReceiptFileInput" onChange={handleFileChange} />
        </div>
        <div>
          <label htmlFor="risc0ReceiptJson">{text.fieldLabels.receiptJson}</label>
          <textarea id="risc0ReceiptJson" value={receiptJson} onChange={(event) => {setReceiptJson(event.target.value);}}/>
        </div>
      </div>
      <div>
        <button id="verifyButton" onClick={async () => setVerificationResult(await verifyRiscZeroReceipt(guestCodeId, receiptJson))}>{text.verifyButtonLabel}</button>
      </div>
      <div id="receiptVerificationResult">{verificationResult}</div>
    </div>
  );
}

export { Verifier, defaultText };
