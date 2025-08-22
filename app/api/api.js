export const API_ENDPOINTS = {
    // =================================================================
    // --- AUTHENTICATION ENDPOINTS ---
    // =================================================================
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REGISTER: '/auth/register',
        REFRESH_TOKEN: '/auth/refresh-token',
        PROFILE: '/auth/me', // Endpoint untuk mendapatkan profil user yang login
    },

    // =================================================================
    // --- USER-FACING ENDPOINTS ---
    // =================================================================
    USER: {
        LOGBOOK: '/users/logbook',
        INSTITUTIONS: {
            CREATE: '/users/institutions',
            GET: `/users/institutions`,
            UPDATE: `/users/institutions`,
            DELETE: `/users/institutions`,
        },
    },

    // =================================================================
    // --- ADMIN ENDPOINTS ---
    // =================================================================
    ADMIN: {
        USERS: {
            GET_ALL: '/admin/users',
            CREATE: '/admin/users',
            GET_BY_ID: (id) => `/admin/users/${id}`,
            UPDATE: (id) => `/admin/users/${id}`,
            DELETE: (id) => `/admin/users/${id}`,
            DELETE_MANY: '/admin/users/delete-many',
        },
        PENDAFTARAN: {
            GET_ALL: '/admin/pendaftaran',
            DELETE: (id) => `/admin/pendaftaran/${id}`,
            DELETE_MANY: '/admin/pendaftaran/delete-many',
            VERIFY: (id) => `/admin/pendaftaran/${id}/verify`,
            VERIFY_MANY: '/admin/pendaftaran/verify-many',
            UPDATE_STATUS_MAGANG: (id) => `/admin/pendaftaran/${id}/status-magang`,
            UPDATE_STATUS_MAGANG_MANY: '/admin/pendaftaran/status-magang-many',
        },
        LOGBOOK: {
            GET_ALL: '/admin/logbook',
            VALIDATE: (id) => `/admin/logbook/${id}/validate`,
            VALIDATE_MANY: '/admin/logbook/validate-many',
        },
        SERTIFIKAT: {
            GET_ALL: '/admin/sertifikat',
            CREATE: '/admin/sertifikat',
            GET_BY_USER_ID: (userId) => `/admin/sertifikat/${userId}`,
            DELETE: (id) => `/admin/sertifikat/${id}`,
            DELETE_MANY: '/admin/sertifikat/delete-many',
        },
        INSTITUTIONS: {
            GET_ALL: '/admin/institutions',
            CREATE: '/admin/institutions',
            GET_BY_ID: (id) => `/admin/institutions/${id}`,
            UPDATE: (id) => `/admin/institutions/${id}`,
            DELETE: (id) => `/admin/institutions/${id}`,
        },
    },

    // =================================================================
    // --- GENERAL/OTHER ENDPOINTS ---
    // =================================================================
    GENERAL: {
        WORK_REQUEST_ALL: '/work-request',
        WORK_ORDER_ALL: '/work-order',
        SCHEDULE_MAINTENANCE_ALL: '/schedule-maintenance-list',
        CONTINENT_ALL: '/continent',
        PARTS_FORECASTER_ALL: '/parts-forecaster',
    },
};

