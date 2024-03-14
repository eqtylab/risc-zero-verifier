import React, { useEffect, useMemo, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
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
    receiptFileMissing: "Please provide a receipt file."
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
    
    try {
      if (receiptBinary) {
        return verifier.verify_receipt_binary(guestCodeId, receiptBinary);
      } else if (receiptJson) {
        return verifier.verify_receipt_json(guestCodeId, receiptJson);
      } else {
        return {
          result: false,
          error: text.errors.receiptFileMissing
        };
      }
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
          setReceiptJson(JSON.stringify(receiptJson));
        } catch (error) {
          // Try to convert from binary, expecting bincode format, if JSON parsing fails
          const fallbackReader = new FileReader();
          fallbackReader.onload = (e) => {
            const arrayBuffer = e.target.result;
            const byteArray = new Uint8Array(arrayBuffer);
            setReceiptBinary(byteArray);
            setReceiptJson(verifier.binary_to_json(byteArray));
          };
          fallbackReader.readAsArrayBuffer(file);
        }
      };

      reader.readAsText(file);
    }
  };

  const shortenGuestCodeId = (guestCodeId) =>
    guestCodeId.length > 8 ? `${guestCodeId.slice(0, 8)}...` : guestCodeId;

  function guestCodeIdOptions() {
    return parsers.map((parser) => ({
      value: parser.guestCodeId,
      label: `${shortenGuestCodeId(parser.guestCodeId)} (${parser.profile.name} ${parser.profile.version})`
    }));
  }

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
        <CreatableSelect
          id={cssId("guest-code-input")}
          isClearable
          options={guestCodeIdOptions()}
          onChange={(option) => setGuestCodeId(option ? option.value : '')} 
          placeholder="Select or enter a guest code id..."
          formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
        />
      </div>
      <div className={cssClass("receipt-file-input-container")}>
        <label htmlFor={cssId("receipt-file-input")}>{text.fieldLabels.receiptFile}</label> 
        <input type="file" id={cssId("receipt-file-input")} onChange={handleFileChange} />
      </div>
      <div className={cssClass("verify-button-container")}>
        <button id={cssId("verify-button")} onClick={() => setVerificationResult(verifyRiscZeroReceipt(guestCodeId, receiptJson))}>{text.verifyButtonLabel}</button>
      </div>

      {verificationResult && (
        <div className={[cssClass("receipt-verification-result"), cssClass(`receipt-verification-result-${verificationResult.result}`)].join(' ')}>
          {
            verificationResult.verified === true ? text.verificationResults.verified : `${text.verificationResults.notVerified} ${verificationResult.error}`
          }

          {verificationResult.verified === true && enableJournalParser && (
            <JournalParser
              guestCodeId={guestCodeId}
              journalBytes={receiptJournalBytes}
              registry={registry}
              ipfsGateway={ipfsGateway}
            />
          )}

        </div>
      )}

    </div>
  );
}

export default Verifier;
