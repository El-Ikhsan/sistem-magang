/**
 * Mengirim gambar KTP ke endpoint AI untuk di-scan.
 * @param {FormData} formData - FormData yang berisi file gambar dengan key 'ktp_image'.
 * @returns {Promise<object>} Data hasil ekstraksi dari KTP.
 */
export async function scanKtp(formData) {
  // Ganti '/api/scan-ktp' dengan endpoint scan Anda yang sebenarnya
  const response = await fetch('/api/user/ktp/scan', {
    method: 'POST',
    body: formData, // Untuk FormData, browser akan mengatur Content-Type secara otomatis
  });

  const result = await response.json();

  if (!response.ok) {
    // Lemparkan error agar bisa ditangkap oleh blok catch di komponen
    throw new Error(result.message || 'Gagal memindai KTP dari server.');
  }

  return result.data; // Kembalikan hanya bagian data dari respons
}

/**
 * Menyimpan data KTP yang sudah divalidasi oleh pengguna ke database.
 * @param {object} finalData - Objek berisi data KTP yang sudah final.
 * @returns {Promise<object>} Data yang berhasil disimpan.
 */
export async function saveKtpData(finalData) {
  // Ganti '/api/save-ktp' dengan endpoint simpan Anda yang sebenarnya
  const response = await fetch('/api/user/ktp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Tambahkan header lain jika perlu, misalnya Authorization
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(finalData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Gagal menyimpan data KTP ke server.');
  }

  return result.data;
}
