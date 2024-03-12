import React, { useEffect, useMemo, useState } from 'react';
import JournalParser from './JournalParser.js';

const DEFAULT_REGISTRY = 'https://risc0.verify.eqtylab.io/registry.json';
const DEFAULT_IPFS_GATEWAY = 'https://w3s.link';

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
  registryUrl = DEFAULT_REGISTRY,
  ipfsGateway = DEFAULT_IPFS_GATEWAY
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
  const [verificationResult, setVerificationResult] = useState(undefined);

  const receiptJournalBytes = useMemo(() => {
    try {
      const journal = JSON.parse(receiptJson).journal;
      const journalBytes = new Uint8Array(journal.bytes);
      return journalBytes;
    } catch {
      return null;
    }
  }, [receiptJson]);

  // TODO: pass this registry to JournalParser
  const [registry, setRegistry] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(registryUrl);
        const json = await response.json();
        setRegistry(json);
      } catch {
        setRegistry(null);
      }
    })();
  }, [registryUrl]);

  const parsers = useMemo(() =>
    registry ? registry.parsers : [], 
    [registry]
  );

  function verifyRiscZeroReceipt(guestCodeId, receiptJson) {
    if (!guestCodeId) {
      return {
        result: false,
        error: text.errors.guestCodeIdMissing
      };
    }
    
    if (!receiptJson) {
      return {
        result: false,
        error: text.errors.receiptJsonMissing
      };
    }
    
    try {
      return verifier.verify_receipt_json(guestCodeId, receiptJson);
    } catch (error) {
      return "Error: " + error;
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
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
          fallbackReader.onload = (e) => {
            const arrayBuffer = e.target.result;
            const byteArray = new Uint8Array(arrayBuffer);
            receiptJson = verifier.binary_to_json(byteArray);
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

  const shortenGuestCodeId = (guestCodeId) =>
    guestCodeId.length > 8 ? `${guestCodeId.slice(0, 8)}...` : guestCodeId;


  function cssId(id) {
    return `${cssPrefix}-${id}-${instanceNumber}`;
  }

  function cssClass(className) {
    return `${cssPrefix}-${className}`;
  }

  return (
    <div className={cssClass("main")}>
      <div className={cssClass("instructions-container")}>
        <p className={cssClass("instructions-text")}>{text.instructions}</p>
        {verifier && (
          <p className={cssClass("instructions-version")}>Receipts must be generated with <code>risc0-zkvm</code> rust crate version <code>{verifier.get_risc0_version()}</code>.</p>
        )}
      </div>
      <div className={cssClass("guest-code-id-container")}>
        <label htmlFor={cssId("guest-code-input")}>{text.fieldLabels.guestCodeId}</label>
        <input type="text" id={cssId("guest-code-input")} value={guestCodeId} onChange={(e) => setGuestCodeId(e.target.value)} />
      </div>
      <div className={cssClass("guest-code-id-select-container")}>
        <label htmlFor={cssId("guest-code-id-select")}>Use a registered guest code ID:</label>
        <select id={cssId("guest-code-id-select")} onChange={(e) => setGuestCodeId(e.target.value)}>
          {parsers.map((parser, i) => (
            <option key={i} value={parser.guestCodeId}>{parser.profile.name} {parser.profile.version}: {shortenGuestCodeId(parser.guestCodeId)}</option>
          ))}
        </select>
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
        <button id={cssId("verify-button")} onClick={() => setVerificationResult(verifyRiscZeroReceipt(guestCodeId, receiptJson))}>{text.verifyButtonLabel}</button>
      </div>

      {verificationResult && (
        <div className={[cssClass("receipt-verification-result"), cssClass(`receipt-verification-result-${verificationResult.result}`)].join(' ')}>
          {
            verificationResult.verified === true ? text.verificationResults.verified : `${text.verificationResults.notVerified} ${verificationResult.error}`
          }
        </div>
      )}

      {enableJournalParser && (
        <JournalParser
          guestCodeId={guestCodeId}
          journalBytes={receiptJournalBytes}
          registryUrl={registryUrl}
          ipfsGateway={ipfsGateway}
        />
      )}

    </div>
  );
}

export default Verifier;
