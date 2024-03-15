# RISC Zero Verifier

This is a verifier for [RISC Zero zkVM](https://dev.risczero.com/api/zkvm/) execution receipts. It's built from rust source code (in order to use the official RISC Zero receipt verification API) using WASM.

There is also a [React component](https://www.npmjs.com/package/@eqty/risc-zero-verifier-react) available.

For more info see https://github.com/eqtylab/risc-zero-verifier

# Usage

```javascript
import("@eqty/risc-zero-verifier")

// Verify a bincode formatted receipt https://docs.rs/bincode/latest/bincode/
verifier.verify_receipt_binary(guestCodeId, receiptBinary);

// Verify a JSON receipt
verifier.verify_receipt_json(guestCodeId, receiptJson);

// Convert a bincode formatted receipt to JSON
verifier.binary_to_json(receiptBinary);
```

## Usage from React
Since it's a wasm package it needs to be loaded asynchronously:
```jsx
useEffect(() => {
  (async () => {
    const wasmPackage = await import("@eqty/risc-zero-verifier");
    const verifier = await wasmPackage.default;
    setVerifier(verifier);
  })();
}, []);
```
