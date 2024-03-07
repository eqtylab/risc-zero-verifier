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
pub async fn binary_to_json(receipt: Vec<u8>) -> Result<JsValue, JsValue> {
    console_error_panic_hook::set_once();

    console::log_1(&JsValue::from_str(
        "Parsing bincode-formatted receipt to JSON...",
    ));

    let receipt: Receipt = bincode::deserialize(&receipt).map_err(|e| {
        JsValue::from_str(&format!(
            "Error deserializing bincode-formatted receipt: {}",
            e
        ))
    })?;

    let receipt_json = serde_json::to_string_pretty(&receipt)
        .map_err(|e| JsValue::from_str(&format!("Error serializing receipt as JSON: {}", e)))?;
    console::log_1(&JsValue::from_str(&format!(
        "Receipt JSON: {}",
        receipt_json
    )));

    Ok(JsValue::from_str(&receipt_json))
}

#[wasm_bindgen]
pub async fn verify_receipt_json(
    guest_code_id_hex_string: &str,
    receipt_json: &str,
) -> Result<JsValue, JsValue> {
    console_error_panic_hook::set_once();

    console::log_1(&JsValue::from_str(&format!(
        "Verifying receipt for guest code with id {}...",
        guest_code_id_hex_string
    )));

    let receipt: Receipt = serde_json::from_str::<Receipt>(receipt_json)
        .map_err(|e| JsValue::from_str(&format!("Error deserializing JSON-formatted receipt: {}", e)))?;

    verify_receipt(guest_code_id_hex_string, receipt).await
}

#[wasm_bindgen]
pub async fn verify_receipt_binary (
    guest_code_id_hex_string: &str,
    receipt_binary: Vec<u8>,
) -> Result<JsValue, JsValue> {
    console_error_panic_hook::set_once();

    console::log_1(&JsValue::from_str(&format!(
        "Verifying receipt for guest code with id {}...",
        guest_code_id_hex_string
    )));

    let receipt: Receipt = bincode::deserialize(&receipt_binary)
        .map_err(|e| JsValue::from_str(&format!("Error deserializing bincode-formatted receipt: {}", e)))?;

    verify_receipt(guest_code_id_hex_string, receipt).await
}

async fn verify_receipt(guest_code_id_hex_string: &str, receipt: Receipt) -> Result<JsValue, JsValue> {
    console_error_panic_hook::set_once();

    let mut result = ReceiptVerificationResult {
        verified: false,
        error: "".to_string(),
    };

    let guest_code_id = Digest::from_hex(guest_code_id_hex_string)
        .map_err(|e| JsValue::from_str(&format!("Error parsing guest code id: {}", e)))?;

    match receipt.verify(guest_code_id) {
        Ok(()) => {
            result.verified = true;
        }
        Err(e) => {
            result.error = format!("Receipt verification error: {}", e);
        }
    }

    match serde_wasm_bindgen::to_value(&result) {
        Ok(value) => Ok(value),
        Err(e) => Err(JsValue::from_str(&format!(
            "Error serializing result: {}",
            e
        ))),
    }
}
