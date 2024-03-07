{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs @ { self, ... }:
    (inputs.flake-utils.lib.eachDefaultSystem (system:
      let

        pkgs = import inputs.nixpkgs {
          inherit system;
          overlays = [ inputs.rust-overlay.overlays.default ];
        };

        inherit (pkgs) callPackage;

        wasm-bindgen-cli = callPackage ./nix/wasm-bindgen-cli.nix { };

        rust-config = {
          extensions = [ "rust-src" ];
          targets = [ "wasm32-unknown-unknown" ];
        };

        rust = (pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain).override rust-config;

        # rustfmt from rust-nightly used for advanced options in rustfmt
        rustfmt-nightly = pkgs.rust-bin.nightly.latest.rustfmt;

        shellDeps = [
          rustfmt-nightly
          rust
          wasm-bindgen-cli
        ] ++ (with pkgs; [
          gnumake
          nodejs_20
          wasm-pack
          yarn
        ]);

      in
      rec {

        devShells = {
          default = pkgs.mkShell ({
            buildInputs = shellDeps;
          });
        };

      }));
}
