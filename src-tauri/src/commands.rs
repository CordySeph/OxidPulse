use crate::models::*;
use crate::diagnostics::{battery, storage, system_info, sensors, stress, crash_dump, scoring, report};

#[tauri::command]
pub fn get_battery_metrics() -> Result<BatterySnapshot, String> {
    battery::get_battery_diagnostics()
}

#[tauri::command]
pub fn get_storage_drives() -> Vec<StorageDriveMetrics> {
    storage::get_storage_diagnostics()
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
