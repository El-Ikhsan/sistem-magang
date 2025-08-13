import bcrypt from 'bcryptjs';

/**
 * @param {import('knex').Knex} knex
 */
export const seed = async function (knex) {
  // Delete all existing data in reverse order of foreign key dependencies
  await knex('sertifikat').del();
  await knex('logbook').del();
  await knex('pendaftaran').del();
  await knex('ktp').del();
  await knex('institutions').del();
  await knex('users').del();

  // Hash passwords
  const password = await bcrypt.hash('password', 10);

  // Insert users with explicit UUIDs for consistent references
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

  // Insert institutions
  await knex('institutions').insert([
    {
      id: '44444444-4444-4444-4444-444444444444',
      user_id: '22222222-2222-2222-2222-222222222222', // Budi's institution
      type: 'universitas',
      name: 'Universitas Negeri Contoh',
      email: 'info@uncontoh.ac.id',
      address: 'Jl. Pendidikan No. 123, Kota Contoh',
      lecturer_name: 'Dr. Ahmad Fauzi, M.Kom',
      whatsapp_supervisor: '081234567891',
      student_id_number: 'NIM20240001',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      user_id: '33333333-3333-3333-3333-333333333333', // Ani's institution
      type: 'SMK',
      name: 'SMK Teknologi Informasi',
      email: 'kontak@smkti.sch.id',
      address: 'Jl. Teknologi No. 45, Kota Contoh',
      lecturer_name: 'Siti Rahayu, S.Kom',
      whatsapp_supervisor: '081987654321',
      student_id_number: 'NIS20240002',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);

  // Insert KTP data
  await knex('ktp').insert([
    {
      id: '66666666-6666-6666-6666-666666666666',
      user_id: '22222222-2222-2222-2222-222222222222', // Budi's KTP
      nik: '3273010101010001',
      name: 'Budi Santoso',
      birth_date: '2000-01-01',
      birth_place: 'Jakarta',
      address: 'Jl. Merdeka No. 10, Jakarta Pusat',
      rt_rw: '001/002',
      kelurahan: 'Gambir',
      kecamatan: 'Gambir',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      gender: 'male',
      marital_status: 'single',
      occupation: 'Mahasiswa',
      citizenship: 'WNI',
      photo_url: 'ktp/budi-santoso.jpg',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: '77777777-7777-7777-7777-777777777777',
      user_id: '33333333-3333-3333-3333-333333333333', // Ani's KTP
      nik: '3273010202020002',
      name: 'Ani Wijaya',
      birth_date: '2001-02-02',
      birth_place: 'Bandung',
      address: 'Jl. Asia Afrika No. 100, Bandung',
      rt_rw: '003/004',
      kelurahan: 'Bandung Wetan',
      kecamatan: 'Bandung Wetan',
      city: 'Bandung',
      province: 'Jawa Barat',
      gender: 'female',
      marital_status: 'single',
      occupation: 'Pelajar',
      citizenship: 'WNI',
      photo_url: 'ktp/ani-wijaya.jpg',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);

  // Insert pendaftaran (registration)
  await knex('pendaftaran').insert([
    {
      id: '88888888-8888-8888-8888-888888888888',
      user_id: '22222222-2222-2222-2222-222222222222', // Budi's registration
      motivation_letter: 'Saya ingin mengembangkan kemampuan programming dan mendapatkan pengalaman kerja yang berharga di perusahaan ini.',
      start_date: '2024-06-01',
      end_date: '2024-08-31',
      ktp_file_path: 'documents/budi/ktp.pdf',
      cv_file_path: 'documents/budi/cv.pdf',
      certificate_file_path: 'documents/budi/certificate.pdf',
      status: 'approved',
      admin_notes: 'Kualifikasi memenuhi syarat',
      approved_by: '11111111-1111-1111-1111-111111111111',
      approved_at: knex.fn.now(),
      status_magang: 'dalam_magang',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: '99999999-9999-9999-9999-999999999999',
      user_id: '33333333-3333-3333-3333-333333333333', // Ani's registration
      motivation_letter: 'Saya berminat untuk belajar langsung di dunia industri dan menerapkan ilmu yang didapat di sekolah.',
      start_date: '2024-07-01',
      end_date: '2024-09-30',
      ktp_file_path: 'documents/ani/ktp.pdf',
      cv_file_path: 'documents/ani/cv.pdf',
      certificate_file_path: 'documents/ani/certificate.pdf',
      status: 'pending',
      admin_notes: null,
      approved_by: null,
      approved_at: null,
      status_magang: 'dalam_magang',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);

  // Insert logbook entries
await knex('logbook').insert([
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    user_id: '22222222-2222-2222-2222-222222222222', // Budi's logbook
    tanggal: '2024-06-03',
    kehadiran: 'wfo', // TAMBAHKAN: Status kehadiran
    kegiatan: 'Orientasi perusahaan',
    deskripsi: 'Pengenalan struktur organisasi dan budaya perusahaan',
    jam_mulai: '08:00',
    jam_selesai: '12:00',
    status: 'validated',
    admin_feedback: 'Baik, user aktif dalam orientasi',
    validated_by: '11111111-1111-1111-1111-111111111111',
    validated_at: knex.fn.now(),
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    user_id: '22222222-2222-2222-2222-222222222222', // Budi's logbook
    tanggal: '2024-06-04',
    kehadiran: 'wfh', // TAMBAHKAN: Status kehadiran
    kegiatan: 'Pelatihan dasar sistem',
    deskripsi: 'Mempelajari alur kerja dan tools yang digunakan',
    jam_mulai: '08:00',
    jam_selesai: '17:00',
    status: 'validated',
    admin_feedback: 'Pemahaman baik terhadap sistem',
    validated_by: '11111111-1111-1111-1111-111111111111',
    validated_at: knex.fn.now(),
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    user_id: '33333333-3333-3333-3333-333333333333', // Ani's logbook
    tanggal: '2024-07-02',
    kehadiran: 'wfo', // TAMBAHKAN: Status kehadiran
    kegiatan: 'Pengenalan tim',
    deskripsi: 'Berkenalan dengan mentor dan anggota tim',
    jam_mulai: '09:00',
    jam_selesai: '12:00',
    status: 'pending',
    admin_feedback: null,
    validated_by: null,
    validated_at: null,
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  }
]);

  // Insert sertifikat (certificates)
  await knex('sertifikat').insert([
    {
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      user_id: '22222222-2222-2222-2222-222222222222', // Budi's certificate
      certificate_number: 'CERT-2024-001',
      file_url: 'certificates/budi-santoso-2024.pdf',
      description: 'Sertifikat penyelesaian program magang periode Juni-Agustus 2024',
      issued_date: '2024-09-01',
      issued_by: '11111111-1111-1111-1111-111111111111',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);

  console.log('✅ Database seeded successfully!');
};