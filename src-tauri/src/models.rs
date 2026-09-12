use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatterySnapshot {
    pub ac_status: String,
    pub battery_life_percent: u8,
    pub battery_flag: u8,
    pub battery_life_time_secs: i64,
    pub design_capacity_mwh: u64,
    pub full_charge_capacity_mwh: u64,
    pub current_capacity_mwh: u64,
    pub cycle_count: u32,
    pub health_percent: f32,
    pub wear_percent: f32,
    pub chemistry: String,
    pub temperature_celsius: Option<f32>,
    pub voltage_mv: u32,
    pub charge_rate_mw: i32,
    pub is_present: bool,
    pub is_charging: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmartAttribute {
    pub id: u8,
    pub name: String,
    pub current_value: u8,
    pub worst_value: u8,
    pub threshold: u8,
    pub raw_value: u64,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageDriveMetrics {
    pub device_id: String,
    pub model: String,
    pub serial_number: String,
    pub firmware_rev: String,
    pub bus_type: String, // "NVMe", "SATA", "SCSI", "USB"
    pub size_bytes: u64,
    pub size_formatted: String,
    pub smart_supported: bool,
    pub health_status: String, // "Healthy", "Warning", "Critical"
    pub health_score: u8,      // 0 - 100
    pub percentage_used: u8,   // NVMe wear percentage
    pub available_spare: u8,
    pub available_spare_threshold: u8,
    pub critical_warnings: Vec<String>,
    pub temperature_celsius: f32,
    pub data_units_read_gb: u64,
    pub data_units_written_gb: u64, // TBW calculation
    pub power_on_hours: u64,
    pub power_cycles: u64,
    pub unsafe_shutdowns: u64,
    pub media_errors: u64,
    pub smart_attributes: Vec<SmartAttribute>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuMetrics {
    pub model: String,
    pub vendor: String,
    pub physical_cores: usize,
    pub logical_cores: usize,
    pub base_frequency_mhz: u64,
    pub current_frequency_mhz: u64,
    pub global_usage_percent: f32,
    pub per_core_usage: Vec<f32>,
    pub per_core_frequencies: Vec<u64>,
    pub temperature_celsius: Option<f32>,
    pub is_throttling: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryMetrics {
    pub total_bytes: u64,
    pub used_bytes: u64,
    pub free_bytes: u64,
    pub available_bytes: u64,
    pub usage_percent: f32,
    pub swap_total_bytes: u64,
    pub swap_used_bytes: u64,
    pub swap_free_bytes: u64,
    pub swap_usage_percent: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessSnapshot {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub memory_bytes: u64,
    pub memory_formatted: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuDeviceMetrics {
    pub name: String,
    pub vendor: String,
    pub driver_version: String,
    pub temperature_celsius: f32,
    pub memory_total_mb: u64,
    pub memory_used_mb: u64,
    pub memory_usage_percent: f32,
    pub core_clock_mhz: u32,
    pub fan_speed_rpm: Option<u32>,
    pub fan_speed_percent: Option<u32>,
    pub power_usage_watts: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThermalSensorMetrics {
    pub cpu_package_temp: f32,
    pub cpu_core_temps: Vec<f32>,
    pub max_temp_recorded: f32,
    pub thermal_zones: Vec<(String, f32)>,
    pub gpu_devices: Vec<GpuDeviceMetrics>,
    pub fan_speeds_rpm: Vec<(String, u32)>,
    pub is_thermal_throttling: bool,
    pub ring0_driver_active: bool,
    pub driver_info: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StressTestProgress {
    pub elapsed_seconds: u64,
    pub total_duration_seconds: u64,
    pub current_temp_celsius: f32,
    pub peak_temp_celsius: f32,
    pub current_frequency_mhz: u64,
    pub is_throttling: bool,
    pub gflops: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StressTestResult {
    pub duration_seconds: u64,
    pub threads_used: usize,
    pub total_iterations: u64,
    pub gflops_score: f64,
    pub initial_temp_celsius: f32,
    pub peak_temp_celsius: f32,
    pub final_temp_celsius: f32,
    pub thermal_throttling_detected: bool,
    pub clock_drop_percent: f32,
    pub stability_score: u8,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemDevice {
    pub name: String,
    pub device_id: String,
    pub error_code: u32,
    pub status: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemStabilityEvent {
    pub timestamp: String,
    pub provider: String,
    pub event_id: u32,
    pub category: String, // "Hardware", "Power", "Driver", "System"
    pub level: String,    // "Critical", "Error", "Warning"
    pub title: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HardwareIntegrityStatus {
    pub score: u8,
    pub status: String, // "Healthy", "Warning", "Critical"
    pub whea_error_count: usize,
    pub problem_device_count: usize,
    pub details: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OsIntegrityStatus {
    pub score: u8,
    pub status: String, // "Healthy", "Warning", "Critical"
    pub sudden_shutdown_count: usize,
    pub minidump_count: usize,
    pub service_timeout_count: usize,
    pub details: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrashDetail {
    pub dump_file_name: String,
    pub dump_path: String,
    pub crash_time: String,
    pub bugcheck_code: String,
    pub bugcheck_symbol: String,
    pub faulting_driver: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrashDumpInfo {
    pub minidump_directory: String,
    pub total_dumps_found: usize,
    pub latest_dump_time: Option<String>,
    pub recent_crashes: Vec<CrashDetail>,
    pub problem_devices: Vec<ProblemDevice>,
    pub stability_events: Vec<SystemStabilityEvent>,
    pub hardware_status: HardwareIntegrityStatus,
    pub os_status: OsIntegrityStatus,
    pub diagnosis_verdict: String,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthWarning {
    pub category: String, // "Battery", "Storage", "Thermal", "Stability"
    pub severity: String, // "Info", "Warning", "Critical"
    pub title: String,
    pub message: String,
    pub impact: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemSummary {
    pub os_name: String,
    pub os_version: String,
    pub kernel_version: String,
    pub hostname: String,
    pub uptime_seconds: u64,
    pub uptime_formatted: String,
    pub cpu_model: String,
    pub cpu_cores: usize,
    pub total_memory_formatted: String,
    pub primary_storage_model: String,
    pub is_admin: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemHealthReport {
    pub overall_score: u8,
    pub status_level: String, // "Excellent", "Good", "Fair", "Attention Needed", "Critical"
    pub battery_subscore: u8,
    pub storage_subscore: u8,
    pub thermal_subscore: u8,
    pub stability_subscore: u8,
    pub warnings: Vec<HealthWarning>,
    pub recommendations: Vec<String>,
    pub generated_at: String,
    pub summary: SystemSummary,
}
