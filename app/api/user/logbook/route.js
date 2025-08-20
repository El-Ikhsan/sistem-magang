import { NextResponse } from 'next/server';
import { Axios } from '../../../utils/axios';
import { API_ENDPOINTS } from '../../api';
import { isAxiosError } from 'axios';

export async function GET(request) {
    try {
        const token = request.cookies.get('authToken')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    // Backend exposes the user's logbook list at /users/logbook/me
    const url = `${API_ENDPOINTS.USERS_LOGBOOK}/me`;
    const response = await Axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) return NextResponse.json(err.response.data, { status: err.response.status });
        console.error('[PROXY GET LOGBOOK]', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const token = request.cookies.get('authToken')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const url = API_ENDPOINTS.USERS_LOGBOOK || '/users/logbook';
        const response = await Axios.post(url, body, { headers: { Authorization: `Bearer ${token}` } });
        return NextResponse.json(response.data, { status: response.status });
    } catch (err) {
        if (isAxiosError(err) && err.response) return NextResponse.json(err.response.data, { status: err.response.status });
        console.error('[PROXY POST LOGBOOK]', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
