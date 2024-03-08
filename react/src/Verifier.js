import React, { useEffect, useMemo, useState } from 'react';
import JournalParser from './JournalParser.js';

const cssPrefix = "risc-zero-verifier";

export const defaultText = {
  verifyButtonLabel: "Verify",
  instructions: "Upload a receipt file as JSON or binary (bincode format), or paste it as JSON into the form field.",
  fieldLabels: {
    guestCodeId: "Guest code id (hex value):",
    receiptFile: "Receipt (bincode format binary file or JSON):",
    receiptJson: "Receipt JSON:"
  },
  verificationResults: {
    verified: "Receipt verified.",
    notVerified: "Receipt not verified: ",
  },
  errors: {
    guestCodeIdMissing: "Please enter a guest code id.",
    receiptJsonMissing: "Please provide a receipt file."
  }
}

function Verifier({
  text = defaultText,
  instanceNumber = 0,
  enableJournalParser = false,
  ipfsGateway = "https://ipfs.io",
}) {
  const [verifier, setVerifier] = useState(null);

  useEffect(() => {
    (async () => {
      const wasmPackage = await import("@eqty/risc-zero-verifier");
      const verifier = await wasmPackage.default
      setVerifier(verifier);
    })();
  }, []);

  const [guestCodeId, setGuestCodeId] = useState('');
  const [receiptBinary, setReceiptBinary] = useState('');
  const [receiptJson, setReceiptJson] = useState('');
  const [verificationResult, setVerificationResult] = useState('');

  const receiptJournalBytes = useMemo(() => {
    try {
      const journal = JSON.parse(receiptJson).journal;
      const journalBytes = new Uint8Array(journal.bytes);
      return journalBytes;
    } catch {
      return null;
    }
  }, [receiptJson]);

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
        return text.verificationResults.verified;
      } else {
        return `${text.verificationResults.notVerified} ${result.error}`;
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
          console.debug("Receipt JSON: ", receiptJson);
        } catch (error) {
          // Try to convert from binary, expecting bincode format, if JSON parsing fails
          const fallbackReader = new FileReader();
          fallbackReader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const byteArray = new Uint8Array(arrayBuffer);
            receiptJson = await verifier.binary_to_json(byteArray);
            setReceiptBinary(byteArray);
            setReceiptJson(receiptJson);
            console.debug("Receipt: ", byteArray);
            console.debug("Receipt JSON: ", receiptJson);
          };
          fallbackReader.readAsArrayBuffer(file);
        }
      };

      reader.readAsText(file);
    }
  };

  function cssId(id) {
    return `${cssPrefix}-${id}-${instanceNumber}`;
  }

  function cssClass(className) {
    return `${cssPrefix}-${className}`;
  }

  return (
    <div className={cssClass("main")}>
      <div className={cssClass("instructions-container")}>
        <p>{text.instructions}</p>
      </div>
      <div className={cssClass("guest-code-id-container")}>
        <label htmlFor={cssId("guest-code-input")}>{text.fieldLabels.guestCodeId}</label>
        <input type="text" id={cssId("guest-code-input")} value={guestCodeId} onChange={(e) => setGuestCodeId(e.target.value)} />
      </div>
      <div className={cssClass("receipt-input-container")}>
        <div className={cssClass("receipt-file-input-container")}>
          <label htmlFor={cssId("receipt-file-input")}>{text.fieldLabels.receiptFile}</label> 
          <input type="file" id={cssId("receipt-file-input")} onChange={handleFileChange} />
        </div>
        <div className={cssClass("receipt-json-input-container")}>
          <label htmlFor={cssId("(receipt-json-input")}>{text.fieldLabels.receiptJson}</label>
          {receiptBinary.length > 2 * 1024 * 1024 ? (
            <p><i>Receipt binary too large to display.</i></p>
          ) : (
            <textarea id={cssId("(receipt-json-input")} value={receiptJson} onChange={(event) => {setReceiptJson(event.target.value);}}/>
          )}
        </div>
      </div>
      <div className={cssClass("verify-button-container")}>
        <button id={cssId("verify-button")} onClick={async () => setVerificationResult(await verifyRiscZeroReceipt(guestCodeId, receiptJson))}>{text.verifyButtonLabel}</button>
      </div>
      <div className={cssClass("receipt-verification-result")}>{verificationResult}</div>

      <br/><br/>
      <hr/>
      <br/><br/>
      
      {enableJournalParser && (
        <JournalParser
          guestCodeId={guestCodeId}
          journalBytes={receiptJournalBytes}
          ipfsGateway={ipfsGateway}
        />
      )}

    </div>
  );
}

export default Verifier;
