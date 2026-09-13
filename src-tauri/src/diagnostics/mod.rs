pub mod battery;
pub mod storage;
pub mod system_info;
pub mod sensors;
pub mod stress;
pub mod crash_dump;
pub mod scoring;
pub mod report;
pub mod benchmark;
pub mod latency;
pub mod memory_test;
pub mod network;
pub mod power;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

/// Creates a `std::process::Command` configured with `CREATE_NO_WINDOW` on Windows
/// to prevent any flashing console / cmd windows during execution.
pub fn silent_command(program: &str) -> std::process::Command {
    #[allow(unused_mut)]
    let mut cmd = std::process::Command::new(program);
    #[cfg(windows)]
    {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }
    cmd
}

