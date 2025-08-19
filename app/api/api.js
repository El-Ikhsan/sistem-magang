export const API_ENDPOINTS = {
    // --- Auth Endpoints ---
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    REGISTER: '/auth/register',
    PROFILE: '/auth/me',

    // --- Admin User Management ---
    USERS: '/admin/user',
    USER_BY_ID: (id) => `/admin/user/${id}`,
    DELETE_USERS_MANY: '/admin/user/delete-many',
    // --- Users Logbook ---
    USERS_LOGBOOK: '/users/logbook',

    // --- Legacy Endpoints (keep for compatibility) ---
    LOGINUSERS: '/auth/login',
    REGISTERUSERS: '/auth/register',
    GET_DETAIL_PROFILE: '/auth/me',
    GETALLWORKREQUEST: '/work-request',
    GETALLWORKORDER: '/work-order',
    GETALLSCHEDULEMAINTENANCE: '/schedule-maintenance-list',
    GETALLCONTINENT: '/continent',
    GETALLPARTSFORECASTER: '/parts-forecaster',
};
