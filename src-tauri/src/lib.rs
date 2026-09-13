pub mod models;
pub mod diagnostics;
pub mod commands;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_battery_metrics,
            get_storage_drives,
            get_logical_volumes,
            get_cpu_metrics,

            get_memory_metrics,
            get_top_processes,
            get_thermal_metrics,
            get_crash_dump_info,
            get_overall_health_report,
            get_system_summary,
            run_stress_test,
            run_cpu_benchmark,
            run_disk_speed_test,
            run_ram_benchmark,
            run_gpu_ai_benchmark,
            export_full_report_json,
            save_json_report_file,
            save_printable_report_html,
            open_file_folder,
            launch_windows_tool,
            get_dpc_latency_metrics,
            run_ram_integrity_test,
            get_network_diagnostics,
            get_power_throttling_diagnostics
        ])

        .run(tauri::generate_context!())
        .expect("error while running OxidPulse application");
}

