import { NextResponse } from 'next/server';

// Fungsi handler harus async dan menerima 'request' sebagai argumen
export async function POST(request) {
  try {
    // Ambil FormData dari request yang masuk
    const formData = await request.formData();
    const ktpImage = formData.get('ktp_image'); // Sesuaikan dengan key di frontend

    if (!ktpImage) {
      return NextResponse.json({ success: false, message: 'File KTP tidak ditemukan.' }, { status: 400 });
    }

    console.log("Menerima data gambar, mensimulasikan panggilan ke API AI...");

    // Simulasi jeda jaringan/proses AI
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulasi respons sukses dari model AI
    const response_data = {
        provinsi: "JAWA BARAT",
        nik: "3273010203040005",
        nama: "BUDI SANTOSO",
        tempat_tgl_lahir: "BANDUNG, 01-01-1990",
        alamat: "JL. CONTOH RAYA NO. 123",
        rt_rw: "001/001",
        kecamatan: "CONTOH KECAMATAN",
        agama: "ISLAM",
        status_perkawinan: "BELUM KAWIN",
        pekerjaan: "PELAJAR/MAHASISWA",
        kewarganegaraan: "WNI",
        berlaku_hingga: "SEUMUR HIDUP",
        gol_darah: "O"
      };

    // Kemas data dalam NextResponse dan kirim kembali
    return NextResponse.json({ success: true, data: response_data });

  } catch (error) {
    console.error("Error di KTP scan handler:", error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan di server.' }, { status: 500 });
  }
}
