use risc0_zkvm::{sha::Digest, Journal};
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

#[wasm_bindgen]
pub fn json_obj_from_journal_bytes(journal: Vec<u8>) -> Result<JsValue, JsValue> {
    let digest = digest_from_journal_bytes(journal)?;

    let json_obj = serde_wasm_bindgen::to_value(&digest).map_err(|e| {
        JsValue::from_str(&format!(
            "Failed to serialize decoded journal to JsValue: {}",
            e
        ))
    })?;

    Ok(json_obj)
}

#[wasm_bindgen]
pub fn statement_from_journal_bytes(journal: Vec<u8>) -> Result<JsValue, JsValue> {
    let digest = digest_from_journal_bytes(journal)?;

    let statement = format!("The password with a **Sha256** hash of **`{digest}`** satisfies the required password constraints.");
    let statement = JsValue::from_str(&statement);

    Ok(statement)
}

fn digest_from_journal_bytes(journal: Vec<u8>) -> Result<Digest, JsValue> {
    let journal = Journal::new(journal);

    let journal = journal
        .decode()
        .map_err(|e| JsValue::from_str(&format!("Failed to decode journal: {e}")))?;

    Ok(journal)
}
