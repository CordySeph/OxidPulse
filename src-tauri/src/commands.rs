use crate::models::*;
use crate::diagnostics::{battery, storage, system_info, sensors, stress, crash_dump, scoring, report, benchmark, latency, memory_test};

#[tauri::command]
pub fn get_battery_metrics() -> Result<BatterySnapshot, String> {
    battery::get_battery_diagnostics()
}

#[tauri::command]
pub fn get_storage_drives() -> Vec<StorageDriveMetrics> {
    storage::get_storage_diagnostics()
}

#[tauri::command]
pub fn get_logical_volumes() -> Vec<LogicalVolumeInfo> {
    storage::get_logical_volumes()
}


#[tauri::command]
pub fn get_cpu_metrics() -> CpuMetrics {
    system_info::get_cpu_diagnostics()
}

#[tauri::command]
pub fn get_memory_metrics() -> MemoryMetrics {
    system_info::get_memory_diagnostics()
}

#[tauri::command]
pub fn get_top_processes(limit: Option<usize>) -> Vec<ProcessSnapshot> {
    system_info::get_top_processes(limit.unwrap_or(10))
}

#[tauri::command]
pub fn get_thermal_metrics() -> ThermalSensorMetrics {
    sensors::get_thermal_and_gpu_diagnostics()
}

#[tauri::command]
pub fn get_crash_dump_info() -> CrashDumpInfo {
    crash_dump::get_crash_dump_diagnostics()
}

#[tauri::command]
pub fn get_overall_health_report() -> SystemHealthReport {
    scoring::generate_overall_health_report()
}

#[tauri::command]
pub fn get_system_summary() -> SystemSummary {
    system_info::get_system_summary()
}

#[tauri::command]
pub async fn run_stress_test(duration_secs: Option<u64>) -> Result<StressTestResult, String> {
    stress::run_cpu_stress_test(duration_secs.unwrap_or(10)).await
}

#[tauri::command]
pub async fn run_cpu_benchmark() -> Result<CpuBenchmarkResult, String> {
    benchmark::run_cpu_benchmark().await
}

#[tauri::command]
pub async fn run_disk_speed_test(
    drive_path: String,
    test_size_mb: Option<u64>,
) -> Result<DiskSpeedTestResult, String> {
    benchmark::run_disk_speed_test(drive_path, test_size_mb).await
}

#[tauri::command]
pub async fn run_ram_benchmark() -> Result<RamBenchmarkResult, String> {
    benchmark::run_ram_benchmark().await
}

#[tauri::command]
pub async fn run_gpu_ai_benchmark(
    duration_secs: Option<u64>,
    gpu_target: Option<String>,
) -> Result<GpuAiBenchmarkResult, String> {
    benchmark::run_gpu_ai_benchmark(duration_secs, gpu_target).await
}



#[tauri::command]
pub async fn run_ram_integrity_test(
    test_size_mb: Option<u64>,
    passes: Option<u32>,
) -> Result<RamIntegrityTestResult, String> {
    memory_test::run_ram_integrity_test(test_size_mb, passes).await
}

#[tauri::command]
pub fn get_dpc_latency_metrics(sample_duration_ms: Option<u64>) -> DpcLatencyMetrics {
    latency::measure_system_latency(sample_duration_ms)
}

#[tauri::command]
pub fn export_full_report_json() -> Result<String, String> {
    report::generate_comprehensive_json()
}

#[tauri::command]
pub fn save_json_report_file() -> Result<String, String> {
    report::save_json_report_file()
}

#[tauri::command]
pub fn save_printable_report_html() -> Result<String, String> {
    report::save_printable_report_html()
}

#[tauri::command]
pub fn open_file_folder(path: String) -> Result<(), String> {
    report::open_file_folder(&path)
}

#[tauri::command]
pub fn launch_windows_tool(#[allow(unused_variables)] tool: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        match tool.as_str() {
            "reliability" => {
                crate::diagnostics::silent_command("powershell")
                    .args(["-NoProfile", "-Command", "Start-Process perfmon.exe -ArgumentList '/rel'"])
                    .spawn()
                    .map_err(|e| e.to_string())?;
                Ok("Launched Windows Reliability Monitor (perfmon /rel)".to_string())
            }
            "devmgmt" => {
                crate::diagnostics::silent_command("powershell")
                    .args(["-NoProfile", "-Command", "Start-Process devmgmt.msc"])
                    .spawn()
                    .map_err(|e| e.to_string())?;
                Ok("Launched Windows Device Manager (devmgmt.msc)".to_string())
            }
            "eventvwr" => {
                crate::diagnostics::silent_command("powershell")
                    .args(["-NoProfile", "-Command", "Start-Process eventvwr.msc"])
                    .spawn()
                    .map_err(|e| e.to_string())?;
                Ok("Launched Windows Event Viewer (eventvwr.msc)".to_string())
            }
            "mdsched" => {
                crate::diagnostics::silent_command("powershell")
                    .args(["-NoProfile", "-Command", "Start-Process mdsched.exe"])
                    .spawn()
                    .map_err(|e| e.to_string())?;
                Ok("Launched Windows Memory Diagnostic (mdsched.exe)".to_string())
            }
            "sfc" => {
                crate::diagnostics::silent_command("powershell")
                    .args(["-NoProfile", "-Command", "Start-Process cmd -ArgumentList '/k sfc /scannow' -Verb RunAs"])
                    .spawn()
                    .map_err(|e| e.to_string())?;
                Ok("Launched Elevated System File Checker (sfc /scannow)".to_string())
            }
            _ => Err(format!("Unknown Windows tool: {}", tool)),
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Windows Diagnostic Tool Launch is only available on Windows OS.".to_string())
    }
}
