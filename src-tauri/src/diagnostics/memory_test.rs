use crate::models::RamIntegrityTestResult;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Instant;

/// Runs a high-speed multi-threaded RAM memory integrity & bit-flip stress test.
pub async fn run_ram_integrity_test(
    test_size_mb: Option<u64>,
    passes: Option<u32>,
) -> Result<RamIntegrityTestResult, String> {
    let test_size_mb = test_size_mb.unwrap_or(1024).clamp(128, 8192);
    let passes = passes.unwrap_or(2).clamp(1, 10);

    let num_threads = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4)
        .clamp(2, 16);

    let mb_per_thread = (test_size_mb / num_threads as u64).max(16);
    let elements_per_thread = (mb_per_thread * 1024 * 1024 / 8) as usize;

    let total_errors = Arc::new(AtomicU64::new(0));
    let total_bytes_tested = (mb_per_thread * num_threads as u64) * 1024 * 1024 * (passes as u64) * 4;

    let start_time = Instant::now();

    for _pass in 1..=passes {
        let mut handles = Vec::with_capacity(num_threads);

        for thread_idx in 0..num_threads {
            let errors_clone = Arc::clone(&total_errors);

            let handle = std::thread::spawn(move || {
                let mut buffer: Vec<u64> = vec![0u64; elements_per_thread];
                let slice = buffer.as_mut_slice();
                let mut local_errors = 0u64;

                // --- Test 1: Checkerboard Pattern (0xAA55AA55AA55AA55) ---
                let pat1 = 0xAA55AA55AA55AA55u64;
                for item in slice.iter_mut() {
                    *item = pat1;
                }
                for item in slice.iter() {
                    if *item != pat1 {
                        local_errors += 1;
                    }
                }

                // --- Test 2: Inverted Checkerboard (0x55AA55AA55AA55AA) ---
                let pat2 = 0x55AA55AA55AA55AAu64;
                for item in slice.iter_mut() {
                    *item = pat2;
                }
                for item in slice.iter() {
                    if *item != pat2 {
                        local_errors += 1;
                    }
                }

                // --- Test 3: Walking Bits (1-bit shift across 64-bit word) ---
                for (i, item) in slice.iter_mut().enumerate() {
                    *item = 1u64 << ((i + thread_idx) % 64);
                }
                for (i, item) in slice.iter().enumerate() {
                    let expected = 1u64 << ((i + thread_idx) % 64);
                    if *item != expected {
                        local_errors += 1;
                    }
                }

                // --- Test 4: Pseudo-Random Bit Inversion (PRNG) ---
                let mut prng_state: u64 = 0x9e3779b97f4a7c15 ^ (thread_idx as u64);
                for item in slice.iter_mut() {
                    prng_state = prng_state.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
                    *item = prng_state;
                }
                let mut verify_prng: u64 = 0x9e3779b97f4a7c15 ^ (thread_idx as u64);
                for item in slice.iter() {
                    verify_prng = verify_prng.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
                    if *item != verify_prng {
                        local_errors += 1;
                    }
                }

                errors_clone.fetch_add(local_errors, Ordering::Relaxed);
            });

            handles.push(handle);
        }

        for h in handles {
            let _ = h.join();
        }
    }

    let elapsed = start_time.elapsed().as_secs_f64();
    let total_gb = total_bytes_tested as f64 / (1024.0 * 1024.0 * 1024.0);
    let bandwidth_gb_s = ((total_gb / elapsed) * 10.0).round() / 10.0;
    let errors_detected = total_errors.load(Ordering::SeqCst);

    let is_passed = errors_detected == 0;
    let status = if is_passed {
        "Passed (100% Stable - No Bit Flips Detected)".to_string()
    } else {
        format!("Failed ({} Bit-Flip Errors - Check RAM Overclock / XMP)", errors_detected)
    };

    Ok(RamIntegrityTestResult {
        total_mb_tested: mb_per_thread * num_threads as u64,
        passes_completed: passes,
        errors_detected,
        memory_bandwidth_gb_s: bandwidth_gb_s,
        duration_seconds: (elapsed * 10.0).round() / 10.0,
        status,
        is_passed,
        tested_patterns: vec![
            "Checkerboard (0xAA55AA55)".to_string(),
            "Inverse Checkerboard (0x55AA55AA)".to_string(),
            "Walking Bits (64-Bit Shift)".to_string(),
            "PRNG Inversion & Bit-Flip Stress".to_string(),
        ],
    })
}
