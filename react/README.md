# RISC Zero Verifier

This is a verifier for [RISC Zero zkVM](https://dev.risczero.com/api/zkvm/) execution receipts.

There is also a [component with no UI](https://www.npmjs.com/package/@eqty/risc-zero-verifier) available.

For more info see https://github.com/eqtylab/risc-zero-verifier

## Usage
Basic usage with defaults:
```jsx
import { Verifier } from "@eqty/risc-zero-verifier-react";

<Verifier />
```

Enable the journal parser. See the [main repo](https://github.com/eqtylab/risc-zero-verifier/tree/main) for more details on the journal parser.
```jsx
<Verifier enableJournalParser={true} />
```

Then journal parser registry can be changed, and a different IPFS gateway can be set.
```jsx
<Verifier
  enableJournalParser={true}
  onStatus={onVerifierStatus}
  registryUrl="http://localhost:3000/registry.json"
  ipfsGateway="http://localhost:8080"
/>
```

A callback function can be passed in to receive status changes and use the status elsewhere on the page:
```jsx
  const onVerifierStatus = (result) => {
    // result is either null or an object like this:
    // {
    //  verified: true/false,
    //  error: "an error message"
    // }
  };

<Verifier
  enableJournalParser={true}
  onStatus={onVerifierStatus}
/>
```

## Styling

The component is unstyled, but has CSS classes defined, including dynamic CSS classes for verification state.
