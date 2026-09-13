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

export interface LogicalVolumeInfo {
  drive_letter: string;
  volume_name: string;
  file_system: string;
  total_bytes: number;
  free_bytes: number;
  used_bytes: number;
  usage_percent: number;
  size_formatted: string;
  free_formatted: string;
}

export interface BenchmarkRecord {
  id: string;
  timestamp: string;
  target_device: string;
  benchmark_type: 'CPU' | 'Disk' | 'RAM' | 'Stress' | string;
  score_summary: string;
  detail_json: string;
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

export interface CpuReferenceComparison {
  cpu_name: string;
  single_core_score: number;
  multi_core_score: number;
  single_relative_percent: number;
  multi_relative_percent: number;
}

export interface CpuBenchmarkResult {
  cpu_model: string;
  single_core_score: number;
  multi_core_score: number;
  multi_thread_ratio: number;
  gflops: number;
  duration_seconds: number;
  threads_used: number;
  initial_temp_celsius: number;
  peak_temp_celsius: number;
  reference_comparisons: CpuReferenceComparison[];
  rating_tier: string;
}

export interface DiskSpeedTestResult {
  drive_letter: string;
  drive_model: string;
  test_size_mb: number;
  seq_read_mb_s: number;
  seq_write_mb_s: number;
  seq_q1t1_read_mb_s?: number;
  seq_q1t1_write_mb_s?: number;
  random_4k_read_mb_s: number;
  random_4k_read_iops: number;
  random_4k_write_mb_s: number;
  random_4k_write_iops: number;
  random_4k_q1t1_read_mb_s?: number;
  random_4k_q1t1_read_iops?: number;
  random_4k_q1t1_write_mb_s?: number;
  random_4k_q1t1_write_iops?: number;
  access_latency_ms: number;
  drive_tier: string;
}

export interface RamBenchmarkResult {
  read_speed_gb_s: number;
  write_speed_gb_s: number;
  latency_ns: number;
  score: number;
  tier: string;
}

export interface RamIntegrityTestResult {
  total_mb_tested: number;
  passes_completed: number;
  errors_detected: number;
  memory_bandwidth_gb_s: number;
  duration_seconds: number;
  status: string;
  is_passed: boolean;
  tested_patterns: string[];
}

export interface FullSystemBenchmarkResult {
  cpu: CpuBenchmarkResult;
  disk?: DiskSpeedTestResult;
  ram: RamBenchmarkResult;
  overall_pc_score: number;
  tier_badge: string;
}

export interface DriverLatencyIssue {
  name: string;
  module: string;
  description: string;
  severity: string;
}

export interface DpcLatencyMetrics {
  current_latency_us: number;
  highest_latency_us: number;
  average_latency_us: number;
  sample_count: number;
  audio_dropout_risk: string;
  status: string;
  is_suitable_for_realtime_audio: boolean;
  suspected_drivers: DriverLatencyIssue[];
  recommendations: string[];
}

export interface PrecisionComputeThroughput {
  precision: string;
  tflops: number;
  native_hardware_support: boolean;
  acceleration_type: string;
  typical_use_cases: string;
}

export interface LlmModelInferenceProfile {
  model_name: string;
  parameter_count: string;
  quantization: string;
  vram_required_mb: number;
  fits_in_vram: boolean;
  offload_to_ram_pct: number;
  estimated_tokens_per_sec: number;
  time_to_first_token_ms: number;
  context_window_supported: number;
  suitability_tag: string;
}

export interface DiffusionModelProfile {
  model_name: string;
  resolution: string;
  vram_required_mb: number;
  fits_in_vram: boolean;
  iterations_per_sec: number;
  time_per_image_sec: number;
  recommended_steps: number;
}

export interface GpuAiComparisonItem {
  gpu_name: string;
  architecture: string;
  vram_gb: number;
  bandwidth_gb_s: number;
  fp16_tflops: number;
  llama8b_tok_s: number;
  is_current_gpu: boolean;
}

export interface GpuAiBenchmarkResult {
  gpu_name: string;
  vendor: string;
  architecture: string;
  driver_version: string;
  vram_total_mb: number;
  vram_used_mb: number;
  vram_free_mb: number;
  memory_bus_width_bits: number;
  memory_bandwidth_gb_s: number;
  compute_cores: number;
  duration_seconds: number;
  total_gemm_passes: number;
  total_ai_gflops_processed: number;
  fp32_tflops: number;
  fp16_tflops: number;
  fp8_tflops: number;
  int4_tflops: number;
  matrix_gemm_time_ms: number;
  precisions: PrecisionComputeThroughput[];
  llm_simulations: LlmModelInferenceProfile[];
  diffusion_simulations: DiffusionModelProfile[];
  gpu_comparisons: GpuAiComparisonItem[];
  initial_temp_celsius: number;
  peak_temp_celsius: number;
  avg_temp_celsius: number;
  avg_power_watts?: number;
  live_temp_celsius: number;
  live_power_watts?: number;
  live_fan_speed_rpm?: number;
  thermal_throttling_detected: boolean;
  sustained_stability_percent: number;
  ai_composite_score: number;
  ai_tier: string;
  ai_recommendation: string;
  is_combined_mode?: boolean;
  gpu_count?: number;
  device_list?: string[];
  multi_gpu_scaling_efficiency?: number;
  pooled_vram_total_mb?: number;
}


