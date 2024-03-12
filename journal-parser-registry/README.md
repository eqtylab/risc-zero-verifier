# Journal Parser Registry

The journal parser registry is a simple registry containing a list of profiles for journal parsers corresponding to RISC Zero zkVM guest code IDs. This registry is primarily used by EQTY Lab for experimentation and demonstration of the web verifier, as such the schema is subject to version increments with changes at any time. We welcome PRs if anyone would like to add a parser profile here for convenience. The `Verifier` react component also has a property to override the default registry url with a user supplied one.

See below for a description of the schema for entities in the registry.

```json
{
  "schemaVersion": "1", // the current schema version
  "profile": {
    "name": "pyzero", // name of the profile
    "version": "0.0.0" // version of the profile
  },
  "guestCodeId": "64460d90ca44c4b3acd709f56d4cb5b4af9f189bbe1b11d49bf238fc6a3e45bf", // code ID of the zkVM guest
  "journalParser": {
    "protocol": "ipfs", // protocol on which the journal parser package is available (right now only "ipfs" is supported, "iroh" coming soon)
    "src": "bafybeigy5vwwt5arpahy6aor4w5fvle57hp54v5pj2yp3dm73i4lffhcge/pyzero_web_verifier.js" // identifier for how to retrieve the package entrypoint on the given protocol
   },
   "repo": [
     "https://github.com/eqtylab/pyzero" // [OPTIONAL] list of links to code repos/mirrors containing relevant source code
   ]
}
```