export interface BatterySnapshot {
  ac_status: string;
  battery_life_percent: number;
  battery_flag: number;
  battery_life_time_secs: number;
  design_capacity_mwh: number;
  full_charge_capacity_mwh: number;
  current_capacity_mwh: number;
  cycle_count: number;
  health_percent: number;
  wear_percent: number;
  chemistry: string;
  temperature_celsius?: number;
  voltage_mv: number;
  charge_rate_mw: number;
  is_present: boolean;
  is_charging: boolean;
}

export interface SmartAttribute {
  id: number;
  name: string;
  current_value: number;
  worst_value: number;
  threshold: number;
  raw_value: number;
  status: string;
}

export interface StorageDriveMetrics {
  device_id: string;
  model: string;
  serial_number: string;
  firmware_rev: string;
  bus_type: string;
  size_bytes: number;
  size_formatted: string;
  smart_supported: boolean;
  health_status: 'Healthy' | 'Warning' | 'Critical' | string;
  health_score: number;
  percentage_used: number;
  available_spare: number;
  available_spare_threshold: number;
  critical_warnings: string[];
  temperature_celsius: number;
  data_units_read_gb: number;
  data_units_written_gb: number;
  power_on_hours: number;
  power_cycles: number;
  unsafe_shutdowns: number;
  media_errors: number;
  smart_attributes: SmartAttribute[];
}

export interface CpuMetrics {
  model: string;
  vendor: string;
  physical_cores: number;
  logical_cores: number;
  base_frequency_mhz: number;
  current_frequency_mhz: number;
  global_usage_percent: number;
  per_core_usage: number[];
  per_core_frequencies: number[];
  temperature_celsius?: number;
  is_throttling: boolean;
}

export interface MemoryMetrics {
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
  available_bytes: number;
  usage_percent: number;
  swap_total_bytes: number;
  swap_used_bytes: number;
  swap_free_bytes: number;
  swap_usage_percent: number;
}

export interface ProcessSnapshot {
  pid: number;
  name: string;
  cpu_usage: number;
  memory_bytes: number;
  memory_formatted: string;
}

export interface GpuDeviceMetrics {
  name: string;
  vendor: string;
  driver_version: string;
  temperature_celsius: number;
  memory_total_mb: number;
  memory_used_mb: number;
  memory_usage_percent: number;
  core_clock_mhz: number;
  fan_speed_rpm?: number;
  fan_speed_percent?: number;
  power_usage_watts?: number;
}

export interface ThermalSensorMetrics {
  cpu_package_temp: number;
  cpu_core_temps: number[];
  max_temp_recorded: number;
  thermal_zones: [string, number][];
  gpu_devices: GpuDeviceMetrics[];
  fan_speeds_rpm: [string, number][];
  is_thermal_throttling: boolean;
  ring0_driver_active: boolean;
  driver_info: string;
}

export interface StressTestResult {
  duration_seconds: number;
  threads_used: number;
  total_iterations: number;
  gflops_score: number;
  initial_temp_celsius: number;
  peak_temp_celsius: number;
  final_temp_celsius: number;
  thermal_throttling_detected: boolean;
  clock_drop_percent: number;
  stability_score: number;
  status: string;
}

export interface ProblemDevice {
  name: string;
  device_id: string;
  error_code: number;
  status: string;
  description: string;
}

export interface SystemStabilityEvent {
  timestamp: string;
  provider: string;
  event_id: number;
  category: 'Hardware' | 'Power' | 'Driver' | 'System' | string;
  level: 'Critical' | 'Error' | 'Warning' | string;
  title: string;
  description: string;
}

export interface HardwareIntegrityStatus {
  score: number;
  status: 'Healthy' | 'Warning' | 'Critical' | string;
  whea_error_count: number;
  problem_device_count: number;
  details: string[];
}

export interface OsIntegrityStatus {
  score: number;
  status: 'Healthy' | 'Warning' | 'Critical' | string;
  sudden_shutdown_count: number;
  minidump_count: number;
  service_timeout_count: number;
  details: string[];
}

export interface CrashDetail {
  dump_file_name: string;
  dump_path: string;
  crash_time: string;
  bugcheck_code: string;
  bugcheck_symbol: string;
  faulting_driver: string;
  description: string;
}

export interface CrashDumpInfo {
  minidump_directory: string;
  total_dumps_found: number;
  latest_dump_time?: string;
  recent_crashes: CrashDetail[];
  problem_devices: ProblemDevice[];
  stability_events: SystemStabilityEvent[];
  hardware_status: HardwareIntegrityStatus;
  os_status: OsIntegrityStatus;
  diagnosis_verdict: string;
  recommendations: string[];
}

export interface HealthWarning {
  category: string;
  severity: 'Info' | 'Warning' | 'Critical' | string;
  title: string;
  message: string;
  impact: string;
}

export interface SystemSummary {
  os_name: string;
  os_version: string;
  kernel_version: string;
  hostname: string;
  uptime_seconds: number;
  uptime_formatted: string;
  cpu_model: string;
  cpu_cores: number;
  total_memory_formatted: string;
  primary_storage_model: string;
  is_admin: boolean;
}

export interface SystemHealthReport {
  overall_score: number;
  status_level: 'Excellent' | 'Good' | 'Fair' | 'Attention Needed' | 'Critical' | string;
  battery_subscore: number;
  storage_subscore: number;
  thermal_subscore: number;
  stability_subscore: number;
  warnings: HealthWarning[];
  recommendations: string[];
  generated_at: string;
  summary: SystemSummary;
}
