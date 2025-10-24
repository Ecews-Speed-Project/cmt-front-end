export interface CaseManager {
    cm_id: number;
    cmt: string;
    created_at: string; // Consider using Date type if you parse it
    facilities: string;
    fullname: string;
    id: string;
    role: string;
    state: string;
}

export interface CMPerformance {
    CaseManagerID: string;
    appointment_compliance: number; // Could also be a number if you prefer
    appointments_completed: number;
    appointments_schedule: number;
    created_date: string; // Consider using Date type if you parse it
    dead: number;
    discontinued: number;
    final_score: number; // Could also be a number if you prefer
    id: number;
    iit: number;
    sample_collection_rate: number; // Could also be a number if you prefer
    suppression_rate: number; // Could also be a number if you prefer
    transferred_out: number;
    tx_cur: number;
    updated_date: string; // Consider using Date type if you parse it
    fy_viral_load_eligible: number;
    viral_load_eligible: number;
    viral_load_results: number;
    viral_load_samples: number;
    viral_load_suppressed: number;
}

export interface CaseManagerPerformance {
    case_manager: CaseManager;
    performance: CMPerformance;
}

//export type { CaseManager, CMPerformance, CaseManagerPerformance };