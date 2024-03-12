// This is a cli-wrapper to slightly modify the password-checker example here: https://github.com/risc0/risc0/tree/main/examples/password-checker
// The modifications are to enable a password to be passed in with a cli arg and to write the proof receipt to a file so it can be uploaded to the web verifier.

use std::{env, fs};

use anyhow::Result;
use password_checker_core::PasswordRequest;
use password_checker_methods::{PW_CHECKER_ELF, PW_CHECKER_ID};
use rand::prelude::*;
use risc0_zkvm::{default_prover, sha::Digest, ExecutorEnv};

fn main() -> Result<()> {
    let args = env::args().collect::<Vec<String>>();

    let password = args
        .get(1)
        .expect("Please provide a password as a command line argument.")
        .to_owned();

    let salt = {
        let mut rng = StdRng::from_entropy();
        let mut salt = [0u8; 32];
        rng.fill_bytes(&mut salt);

        salt
    };

    let request = PasswordRequest { password, salt };

    let env = ExecutorEnv::builder().write(&request)?.build()?;

    let receipt = default_prover().prove(env, PW_CHECKER_ELF)?;

    let password_hash = receipt.journal.decode::<Digest>()?;

    fs::write("receipt.bin", bincode::serialize(&receipt)?)?;

    println!("Password hash is: {}", &password_hash);

    println!("Proven with guest ID: {}", guest_id());

    Ok(())
}

fn guest_id() -> String {
    hex::encode(vec_u8_from_u32_slice_little_endian(&PW_CHECKER_ID))
}

fn vec_u8_from_u32_slice_little_endian(v: &[u32]) -> Vec<u8> {
    v.iter().flat_map(|&x| x.to_le_bytes().to_vec()).collect()
}
