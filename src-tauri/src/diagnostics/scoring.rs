use crate::models::{HealthWarning, SystemHealthReport};
use crate::diagnostics::{battery, storage, system_info, sensors, crash_dump};

pub fn generate_overall_health_report() -> SystemHealthReport {
    let battery_metrics = battery::get_battery_diagnostics().ok();
    let storage_drives = storage::get_storage_diagnostics();
    let thermal_metrics = sensors::get_thermal_and_gpu_diagnostics();
    let crash_info = crash_dump::get_crash_dump_diagnostics();
    let summary = system_info::get_system_summary();

    let mut warnings = Vec::new();
    let mut recommendations = Vec::new();

    // 1. Battery Scoring (Default 95 if desktop / no battery)
    let battery_subscore: u8 = if let Some(bat) = &battery_metrics {
        if bat.is_present {
            let score = (bat.health_percent as u8).min(100);
            if bat.wear_percent > 30.0 {
                warnings.push(HealthWarning {
                    category: "Battery".to_string(),
                    severity: "Warning".to_string(),
                    title: "High Battery Wear Level".to_string(),
                    message: format!(
                        "Battery has worn down by {:.1}%. Full charge capacity is {} mWh vs designed {} mWh.",
                        bat.wear_percent, bat.full_charge_capacity_mwh, bat.design_capacity_mwh
                    ),
                    impact: "Significantly reduced unplugged runtime. Consider battery calibration or replacement.".to_string(),
                });
                recommendations.push("Enable battery charging threshold (80% limit) in BIOS / OEM utility to prolong lifespan.".to_string());
            }
            score
        } else {
            100
        }
    } else {
        100
    };

    // 2. Storage Scoring (Averaged across drives, penalized by critical warnings)
    let mut storage_scores = Vec::new();
    for drive in &storage_drives {
        let mut drive_score = drive.health_score;
        if !drive.critical_warnings.is_empty() {
            drive_score = drive_score.saturating_sub(40);
            for warn in &drive.critical_warnings {
                warnings.push(HealthWarning {
                    category: "Storage".to_string(),
                    severity: "Critical".to_string(),
                    title: format!("{}: {}", drive.device_id, warn),
                    message: format!("Drive {} reported SMART critical flag: {}", drive.model, warn),
                    impact: "Risk of data corruption or device failure. Backup critical data immediately.".to_string(),
                });
            }
            recommendations.push(format!("Immediate backup recommended for {}.", drive.model));
        }

        if drive.percentage_used > 80 {
            warnings.push(HealthWarning {
                category: "Storage".to_string(),
                severity: "Warning".to_string(),
                title: format!("{}: High TBW / Wear", drive.device_id),
                message: format!("SSD endurance consumed is {}% (TBW: {} GB written).", drive.percentage_used, drive.data_units_written_gb),
                impact: "NAND flash endurance reaching manufacturer warranty limits.".to_string(),
            });
        }
        storage_scores.push(drive_score);
    }

    let storage_subscore = if !storage_scores.is_empty() {
        let sum: u32 = storage_scores.iter().map(|&s| s as u32).sum();
        (sum / storage_scores.len() as u32) as u8
    } else {
        95
    };

    // 3. Thermal Scoring
    let mut thermal_subscore: u8 = 95;
    if thermal_metrics.cpu_package_temp > 85.0 || thermal_metrics.is_thermal_throttling {
        thermal_subscore = 65;
        warnings.push(HealthWarning {
            category: "Thermal".to_string(),
            severity: "Warning".to_string(),
            title: "Elevated CPU Temperatures".to_string(),
            message: format!("CPU package reached {:.1}°C. Throttling threshold may be engaged.", thermal_metrics.cpu_package_temp),
            impact: "Reduced boost frequencies, thermal throttling under continuous load.".to_string(),
        });
        recommendations.push("Inspect heatsink thermal paste and clean cooling dust filters.".to_string());
    } else if thermal_metrics.cpu_package_temp > 70.0 {
        thermal_subscore = 82;
    }

    // 4. Stability / Crash Dump Scoring
    let mut stability_subscore: u8 = 100;
    if crash_info.total_dumps_found > 0 {
        let penalty = (crash_info.total_dumps_found as u8 * 8).min(35);
        stability_subscore = stability_subscore.saturating_sub(penalty);

        if let Some(recent) = crash_info.recent_crashes.first() {
            warnings.push(HealthWarning {
                category: "Stability".to_string(),
                severity: "Warning".to_string(),
                title: format!("Recent BSOD Crash: {}", recent.bugcheck_symbol),
                message: format!("System crashed on {} due to {}. Faulting driver: {}", recent.crash_time, recent.bugcheck_symbol, recent.faulting_driver),
                impact: "Unscheduled reboot or application crash.".to_string(),
            });
            recommendations.push(format!("Check for updated WHQL drivers for {} ({})", recent.faulting_driver, recent.bugcheck_symbol));
        }
    }

    // Overall Weighted Health Score:
    // Battery: 20%, Storage: 35%, Thermal: 25%, Stability: 20%
    let overall_score_f = (battery_subscore as f32 * 0.20)
        + (storage_subscore as f32 * 0.35)
        + (thermal_subscore as f32 * 0.25)
        + (stability_subscore as f32 * 0.20);

    let overall_score = (overall_score_f.round() as u8).clamp(1, 100);

    let status_level = match overall_score {
        90..=100 => "Excellent",
        75..=89 => "Good",
        60..=74 => "Fair",
        40..=59 => "Attention Needed",
        _ => "Critical",
    }.to_string();

    if recommendations.is_empty() {
        recommendations.push("All hardware health diagnostics within optimal operating parameters.".to_string());
        recommendations.push("Perform monthly SSD TRIM optimization and SMART health verification.".to_string());
    }

    let now: chrono::DateTime<chrono::Local> = chrono::Local::now();
    let generated_at = now.format("%Y-%m-%d %H:%M:%S").to_string();

    SystemHealthReport {
        overall_score,
        status_level,
        battery_subscore,
        storage_subscore,
        thermal_subscore,
        stability_subscore,
        warnings,
        recommendations,
        generated_at,
        summary,
    }
}
