// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import { Axios } from "../../../utils/axios";
// import { API_ENDPOINTS } from "../../../api/api";

// export async function POST(request) {
//     const cookieStore = await cookies();
//     const refreshToken = cookieStore.get('refreshToken')?.value;

//     if (!refreshToken) {
//         return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
//     }

//     try {
//         // Panggil backend utama, kirimkan refresh token dalam header 'Cookie'
//         const response = await Axios.post(
//             API_ENDPOINTS.REFRESH_TOKEN, {}, {
//                 headers: {
//                     // Set header Cookie secara manual
//                     'Cookie': `refreshToken=${refreshToken}`
//                 }
//             }
//         );

//         return NextResponse.json(response.data);
//     } catch (error) {
//         return NextResponse.json({ success: false, message: 'Session expired' }, { status: 401 });
//     }
// }
