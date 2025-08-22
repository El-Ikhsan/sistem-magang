/**
 * Base URL konfigurasi
 * NEXT_PUBLIC_API_URL = Next.js API routes (http://localhost:3100/api)
 * NEXT_PUBLIC_API_URL_PYTHON = FastAPI Python backend (http://localhost:8000)
 */
const NEXTJS_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100/api';
const PYTHON_API_URL = process.env.NEXT_PUBLIC_API_URL_PYTHON || 'http://localhost:8000';

/**
 * Mengirim gambar KTP ke backend FastAPI untuk ekstraksi data
 * Menggunakan Python backend (FastAPI) untuk AI processing
 * @param {FormData} formData - FormData yang berisi file gambar dengan key 'file'
 * @returns {Promise<object>} Response dari backend berisi data hasil ekstraksi
 */
export async function scanKtp(formData) {
  try {
    const response = await fetch(`${PYTHON_API_URL}/extract-ktp`, {
      method: 'POST',
      body: formData, // Let browser set Content-Type automatically
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result.detail || result.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMsg);
    }

    return result;
  } catch (error) {
    console.error('Error in scanKtp:', error);
    
    // Convert error to meaningful message
    let userMessage = 'Terjadi kesalahan saat memindai KTP';
    if (error.message.includes('Failed to fetch')) {
      userMessage = 'Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.';
    } else if (error.message.includes('422')) {
      userMessage = 'Format file tidak valid. Harap upload gambar KTP yang jelas.';
    }
    
    throw new Error(userMessage);
  }
}

/**
 * Alternative scanKtp function - without /api prefix (if you prefer to update your FastAPI instead)
 * Use this if you implement the original endpoint without /api prefix
 */
export async function scanKtpOriginal(formData) {
  try {
    const response = await fetch(`${PYTHON_API_URL}/extract-ktp`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('Error in scanKtpOriginal:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke Python backend. Pastikan FastAPI sedang berjalan di port 8000.');
    }
    
    throw error;
  }
}

/**
 * Menyimpan data KTP yang sudah divalidasi ke Next.js API
 * Menggunakan Next.js API routes untuk database operations
 * @param {object} ktpData - Data KTP yang akan disimpan
 * @returns {Promise<object>} Response dari backend
 */
export async function saveKtpData(ktpData) {
  try {
    const response = await fetch(`${NEXTJS_API_URL}/ktp/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Tambahkan header authentication jika diperlukan
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ktpData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('Error in saveKtpData:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke Next.js API. Pastikan server sedang berjalan.');
    }
    
    throw error;
  }
}

/**
 * Health check untuk memastikan Python backend (FastAPI) berjalan
 * @returns {Promise<object>} Status backend
 */
export async function checkPythonBackendHealth() {
  try {
    const response = await fetch(`${PYTHON_API_URL}/health`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Python backend health check failed: ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error('Python backend health check error:', error);
    throw new Error('Python backend tidak dapat diakses');
  }
}

/**
 * Health check untuk Next.js API
 * @returns {Promise<object>} Status Next.js API
 */
export async function checkNextjsApiHealth() {
  try {
    const response = await fetch(`${NEXTJS_API_URL}/health`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Next.js API health check failed: ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error('Next.js API health check error:', error);
    throw new Error('Next.js API tidak dapat diakses');
  }
}