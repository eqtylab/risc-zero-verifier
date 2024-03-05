use hex::FromHex;
use risc0_zkvm::{sha::Digest, Receipt};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use web_sys::console;

#[derive(Serialize, Deserialize)]
struct ReceiptVerificationResult {
    verified: bool,
    error: String,
}

#[wasm_bindgen]
pub async fn verify_risc_zero_receipt(
    guest_code_id_hex_string: &str,
    receipt_json: &str,
) -> Result<JsValue, JsValue> {
    console_error_panic_hook::set_once();

    console::log_1(&JsValue::from_str(&format!(
        "Verifying receipt for guest code with id {}: {}",
        guest_code_id_hex_string, receipt_json,
    )));

    let mut result = ReceiptVerificationResult {
        verified: false,
        error: "".to_string(),
    };

    let guest_code_id = Digest::from_hex(guest_code_id_hex_string).map_err(|e| {
        JsValue::from_str(&format!("Error parsing guest code id: {}", e))
    })?;

    match serde_json::from_str::<Receipt>(receipt_json) {
        Ok(receipt) => match receipt.verify(guest_code_id) {
            Ok(()) => {
                result.verified = true;
            }
            Err(e) => {
                result.error = format!("Receipt verification error: {}", e);
            }
        },
        Err(e) => {
            result.error = format!("Error deserializing receipt: {}", e);
        }
    };

    match serde_wasm_bindgen::to_value(&result) {
        Ok(value) => Ok(value),
        Err(e) => Err(JsValue::from_str(&format!(
            "Error serializing result: {}",
            e
        ))),
    }
}
