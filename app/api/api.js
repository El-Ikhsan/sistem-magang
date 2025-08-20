export const API_ENDPOINTS = {
    // --- Auth Endpoints ---
    LOGINUSERS: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    REGISTERUSERS: '/auth/register',

    // --- Admin Endpoints ---
    ADMIN_USERS: {
        GET_ALL: '/admin/users',
        CREATE: '/admin/users',
        GET_BY_ID: (id) => `/admin/users/${id}`,
        UPDATE: (id) => `/admin/users/${id}`,
        DELETE: (id) => `/admin/users/${id}`,
        DELETE_MANY: '/admin/users/delete-many',
    },
    ADMIN_PENDAFTARAN: {
        GET_ALL: '/admin/pendaftaran',
        VERIFY: (id) => `/admin/pendaftaran/${id}/verify`,
        UPDATE_STATUS_MAGANG: (id) => `/admin/pendaftaran/${id}/status-magang`,
        DELETE: (id) => `/admin/pendaftaran/${id}`,
        DELETE_MANY: '/admin/pendaftaran/delete-many',
        VERIFY_MANY: '/admin/pendaftaran/verify-many',
        UPDATE_STATUS_MAGANG_MANY: '/admin/pendaftaran/status-magang-many',
    },
    ADMIN_LOGBOOK: {
        GET_ALL: '/admin/logbook',
        VALIDATE: (id) => `/admin/logbook/${id}/validate`,
        VALIDATE_MANY: '/admin/logbook/validate-many',
    },
    ADMIN_SERTIFIKAT: {
        GET_ALL: '/admin/sertifikat',
        CREATE: '/admin/sertifikat',
        GET_BY_USER_ID: (id) => `/admin/sertifikat/${id}`,
        DELETE: (id) => `/admin/sertifikat/${id}`,
        DELETE_MANY: '/admin/sertifikat/delete-many',
    },
};
