// app/api/api.js
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100/api";

export const API_ENDPOINTS = {
    // --- Auth Endpoints ---
    LOGINUSERS: `${API_URL}/auth/login`,
    LOGOUT: `${API_URL}/auth/logout`,

    // --- General & Legacy Endpoints ---
    GETALLWORKREQUEST: `${API_URL}/work-request`,
    GETALLWORKORDER: `${API_URL}/work-order`,
    GETALLSCHEDULEMAINTENANCE: `${API_URL}/schedule-maintenance-list`,
    GETALLCONTINENT: `${API_URL}/continent`,
    GETALLPARTSFORECASTER: `${API_URL}/parts-forecaster`,

    // detail profile
    GET_DETAIL_PROFILE: `${API_URL}/user-detail`,
};
