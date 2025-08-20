import { NextResponse } from 'next/server';
import { Axios } from '../../../../utils/axios';
import { API_ENDPOINTS } from '../../../api';
import { isAxiosError } from 'axios';

export async function GET(request, { params }) {
    try {
        const token = request.cookies.get('authToken')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const response = await Axios.get(`/users/logbook/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) return NextResponse.json(err.response.data, { status: err.response.status });
        console.error('[PROXY GET LOGBOOK BY ID]', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const token = request.cookies.get('authToken')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const response = await Axios.patch(`/users/logbook/${id}`, body, { headers: { Authorization: `Bearer ${token}` } });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) return NextResponse.json(err.response.data, { status: err.response.status });
        console.error('[PROXY PATCH LOGBOOK]', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const token = request.cookies.get('authToken')?.value;
        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const response = await Axios.delete(`/users/logbook/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        return NextResponse.json(response.data);
    } catch (err) {
        if (isAxiosError(err) && err.response) return NextResponse.json(err.response.data, { status: err.response.status });
        console.error('[PROXY DELETE LOGBOOK]', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
