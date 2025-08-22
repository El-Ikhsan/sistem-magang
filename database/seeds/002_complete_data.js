import bcrypt from 'bcryptjs';
import { logger } from '../../config/logger.js';

/**
 * @param {import('knex').Knex} knex
 */
export const seed = async function (knex) {
  // Hapus semua data yang ada dengan urutan terbalik untuk menghindari error foreign key
  await knex('sertifikat').del();
  await knex('sertifikat_configs').del(); // Tambahan untuk tabel baru
  await knex('logbook').del();
  await knex('pendaftaran').del();
  await knex('ktp').del();
  await knex('institutions').del();
  await knex('users').del();

  // Hash password
  const password = await bcrypt.hash('password', 10);

  // Masukkan data user dengan UUID eksplisit untuk referensi yang konsisten
  const users = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Admin Sistem',
      email: 'admin@example.com',
      password: password,
      role: 'admin',
      status: 'active',
      avatar_url: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Budi Santoso',
      email: 'user@example.com',
      password: password,
      role: 'user',
      status: 'active',
      avatar_url: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Ani Wijaya',
      email: 'ani@student.com',
      password: password,
      role: 'user',
      status: 'active',
      avatar_url: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ];
  await knex('users').insert(users);

  // --- PERUBAHAN DIMULAI DI SINI ---

  // Masukkan data konfigurasi sertifikat
  await knex('sertifikat_configs').insert([
    {
        id: 'config-uuid-01',
        template_name: 'Template Magang Utama 2025',
        company_name: 'PT Teknologi Nusantara',
        company_logo_url: '/logos/company-logo.png',
        background_image_url: '/templates/certificate-bg.png',
        leader_name: 'Dr. Ahmad Fauzi, M.Kom',
        description: 'Sertifikat ini diberikan sebagai bukti telah menyelesaikan program magang dengan baik.',
        certificate_prefix: 'MPX/CERT/2025',
        is_active: true, // Template ini yang akan digunakan
        admin_id: '11111111-1111-1111-1111-111111111111'
    }
  ]);

  // Masukkan data sertifikat (disesuaikan dengan skema baru)
  await knex('sertifikat').insert([
    {
      user_id: '22222222-2222-2222-2222-222222222222', // Budi's certificate
      certificate_prefix: 'MPX/CERT/2025', // Diambil dari config aktif
      certificate_sequence: 1, // Nomor urut pertama untuk prefix ini
      file_url: 'certificates/budi-santoso-2025.pdf',
      description: 'Sertifikat penyelesaian program magang periode Juni-Agustus 2025',
      issued_date: '2025-09-01',
      issued_by: '11111111-1111-1111-1111-111111111111',
    }
  ]);
  
  // --- PERUBAHAN SELESAI DI SINI ---


  // Masukkan data institusi
  await knex('institutions').insert([
    {
      id: '44444444-4444-4444-4444-444444444444',
      user_id: '22222222-2222-2222-2222-222222222222', // Budi
      type: 'universitas',
      name: 'Universitas Negeri Contoh',
      email: 'info@uncontoh.ac.id',
      address: 'Jl. Pendidikan No. 123, Kota Contoh',
      lecturer_name: 'Dr. Ahmad Fauzi, M.Kom',
      whatsapp_supervisor: '081234567891',
      student_id_number: 'NIM20240001',
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      user_id: '33333333-3333-3333-3333-333333333333', // Ani
      type: 'SMK',
      name: 'SMK Teknologi Informasi',
      email: 'kontak@smkti.sch.id',
      address: 'Jl. Teknologi No. 45, Kota Contoh',
      lecturer_name: 'Siti Rahayu, S.Kom',
      whatsapp_supervisor: '081987654321',
      student_id_number: 'NIS20240002',
    }
  ]);

  // Masukkan data pendaftaran
  await knex('pendaftaran').insert([
    {
      user_id: '22222222-2222-2222-2222-222222222222', // Budi
      motivation_letter: 'Saya ingin mengembangkan kemampuan programming.',
      start_date: '2025-06-01',
      end_date: '2025-08-31',
      status: 'approved',
      status_magang: 'lulus',
      approved_by: '11111111-1111-1111-1111-111111111111',
    },
    {
      user_id: '33333333-3333-3333-3333-333333333333', // Ani
      motivation_letter: 'Saya berminat untuk belajar langsung di dunia industri.',
      start_date: '2025-07-01',
      end_date: '2025-09-30',
      status: 'pending',
      status_magang: 'dalam_magang',
    }
  ]);

  // Masukkan data logbook
  await knex('logbook').insert([
    {
      user_id: '22222222-2222-2222-2222-222222222222', // Budi
      tanggal: '2025-06-03',
      kehadiran: 'wfo',
      kegiatan: 'Orientasi perusahaan',
      deskripsi: 'Pengenalan struktur organisasi dan budaya perusahaan',
      jam_mulai: '08:00',
      jam_selesai: '12:00',
      status: 'validated',
      validated_by: '11111111-1111-1111-1111-111111111111',
    },
    {
      user_id: '33333333-3333-3333-3333-333333333333', // Ani
      tanggal: '2025-07-02',
      kehadiran: 'wfo',
      kegiatan: 'Pengenalan tim',
      deskripsi: 'Berkenalan dengan mentor dan anggota tim',
      jam_mulai: '09:00',
      jam_selesai: '12:00',
      status: 'pending',
    }
  ]);

  logger.info('✅ Database seeded successfully!');
};
