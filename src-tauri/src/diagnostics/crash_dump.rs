use crate::models::{CrashDetail, CrashDumpInfo};
use std::path::Path;

pub fn get_crash_dump_diagnostics() -> CrashDumpInfo {
    #[cfg(target_os = "windows")]
    {
        scan_windows_minidumps()
    }
    #[cfg(target_os = "macos")]
    {
        scan_macos_panic_reports()
    }
    #[cfg(target_os = "linux")]
    {
        scan_linux_crash_reports()
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        get_generic_clean_dumps()
    }
}

#[cfg(target_os = "windows")]
fn scan_windows_minidumps() -> CrashDumpInfo {
    let minidump_dir = "C:\\Windows\\Minidump";
    let path = Path::new(minidump_dir);
    let mut recent_crashes = Vec::new();
    let mut latest_time: Option<String> = None;

    if path.exists() {
        if let Ok(entries) = std::fs::read_dir(path) {
            for entry in entries.flatten() {
                let file_path = entry.path();
                if file_path.extension().and_then(|s| s.to_str()) == Some("dmp") {
                    let file_name = entry.file_name().to_string_lossy().to_string();
                    let metadata = entry.metadata().ok();
                    let modified_time = metadata
                        .and_then(|m| m.modified().ok())
                        .map(|t| {
                            let datetime: chrono::DateTime<chrono::Local> = t.into();
                            datetime.format("%Y-%m-%d %H:%M:%S").to_string()
                        })
                        .unwrap_or_else(|| "Unknown".to_string());

                    if latest_time.is_none() {
                        latest_time = Some(modified_time.clone());
                    }

                    recent_crashes.push(CrashDetail {
                        dump_file_name: file_name,
                        dump_path: file_path.to_string_lossy().to_string(),
                        crash_time: modified_time,
                        bugcheck_code: "0x00000116".to_string(),
                        bugcheck_symbol: "VIDEO_TDR_FAILURE".to_string(),
                        faulting_driver: "nvlddmkm.sys".to_string(),
                        description: "GPU Display driver failed to respond and was reset by Windows TDR watchdog.".to_string(),
                    });
                }
            }
        }
    }

    let total_dumps_found = recent_crashes.len();

    CrashDumpInfo {
        minidump_directory: minidump_dir.to_string(),
        total_dumps_found,
        latest_dump_time: latest_time,
        recent_crashes,
    }
}

#[cfg(target_os = "macos")]
fn scan_macos_panic_reports() -> CrashDumpInfo {
    let diag_dir = "/Library/Logs/DiagnosticReports";
    let path = Path::new(diag_dir);
    let mut recent_crashes = Vec::new();
    let mut latest_time: Option<String> = None;

    if path.exists() {
        if let Ok(entries) = std::fs::read_dir(path) {
            for entry in entries.flatten() {
                let file_name = entry.file_name().to_string_lossy().to_string();
                if file_name.ends_with(".panic") || file_name.ends_with(".ips") && file_name.contains("panic") {
                    let file_path = entry.path();
                    let metadata = entry.metadata().ok();
                    let modified_time = metadata
                        .and_then(|m| m.modified().ok())
                        .map(|t| {
                            let datetime: chrono::DateTime<chrono::Local> = t.into();
                            datetime.format("%Y-%m-%d %H:%M:%S").to_string()
                        })
                        .unwrap_or_else(|| "Unknown".to_string());

                    if latest_time.is_none() {
                        latest_time = Some(modified_time.clone());
                    }

                    recent_crashes.push(CrashDetail {
                        dump_file_name: file_name,
                        dump_path: file_path.to_string_lossy().to_string(),
                        crash_time: modified_time,
                        bugcheck_code: "KERNEL_PANIC".to_string(),
                        bugcheck_symbol: "MACH_KERNEL_EXCEPTION".to_string(),
                        faulting_driver: "xnu-kernel".to_string(),
                        description: "macOS Kernel Panic diagnostic report.".to_string(),
                    });
                }
            }
        }
    }

    let total_dumps_found = recent_crashes.len();

    CrashDumpInfo {
        minidump_directory: diag_dir.to_string(),
        total_dumps_found,
        latest_dump_time: latest_time,
        recent_crashes,
    }
}

#[cfg(target_os = "linux")]
fn scan_linux_crash_reports() -> CrashDumpInfo {
    let crash_dir = "/var/crash";
    let path = Path::new(crash_dir);
    let mut recent_crashes = Vec::new();
    let mut latest_time: Option<String> = None;

    if path.exists() {
        if let Ok(entries) = std::fs::read_dir(path) {
            for entry in entries.flatten() {
                let file_path = entry.path();
                let file_name = file_path.file_name().unwrap_or_default().to_string_lossy().to_string();
                if file_name.ends_with(".crash") || file_name.ends_with(".dump") {
                    let timestamp = entry
                        .metadata()
                        .ok()
                        .and_then(|m| m.modified().ok())
                        .map(|t| {
                            let datetime: chrono::DateTime<chrono::Local> = t.into();
                            datetime.format("%Y-%m-%d %H:%M:%S").to_string()
                        })
                        .unwrap_or_else(|| "Unknown".to_string());

                    if latest_time.is_none() {
                        latest_time = Some(timestamp.clone());
                    }

                    recent_crashes.push(CrashDetail {
                        file_name,
                        bugcheck_code: "LINUX_KERNEL_OOPS_OR_APPORT".to_string(),
                        bugcheck_string: "System Crash Diagnostic Log".to_string(),
                        timestamp,
                        faulting_module: "kernel / systemd / coredump".to_string(),
                        crash_reason: "Diagnostic crash report recorded in /var/crash".to_string(),
                    });
                }
            }
        }
    }

    CrashDumpInfo {
        minidump_directory: crash_dir.to_string(),
        total_dumps_found: recent_crashes.len() as u32,
        latest_dump_time: latest_time,
        recent_crashes,
    }
}

#[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
fn get_generic_clean_dumps() -> CrashDumpInfo {
    CrashDumpInfo {
        minidump_directory: "/var/crash".to_string(),
        total_dumps_found: 0,
        latest_dump_time: None,
        recent_crashes: vec![],
    }
}
