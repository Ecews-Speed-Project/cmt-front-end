interface Appointments {
    completed: number;
    completion_rate: number;
    scheduled: number;
}

interface ViralLoad {
    fy_eligible: number;
    eligible: number;
    samples: number;
    results: number;
    suppressed: number;
    suppression_rate: number;
}

interface CMTPerformanceData {
    appointments: Appointments;
    average_score: number;
    case_managers_count: number;
    cmt: string;
    iit: number;
    transferred_out: number;
    discontinued: number;
    dead: number;
    state: string;
    facility_name: string;
    tx_cur: number;
    viral_load: ViralLoad;
}

export type { CMTPerformanceData };