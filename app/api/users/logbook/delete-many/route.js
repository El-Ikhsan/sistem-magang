import { NextResponse } from 'next/server';
import { Axios } from '../../../../utils/axios';
import { isAxiosError } from 'axios';

export async function POST(request) {
    try {
        const token = request.cookies.get('authToken')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const response = await Axios.post('/users/logbook/delete-many', body, { headers: { Authorization: `Bearer ${token}` } });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) return NextResponse.json(err.response.data, { status: err.response.status });
        console.error('[PROXY DELETE-MANY LOGBOOK]', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
