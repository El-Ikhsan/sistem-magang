import { seed as seedAdminOnly } from './001_admin_user.js';
import { seed as seedAllData } from './002_complete_data.js';
import { logger } from '../../config/logger.js';

/**
 * @param {import("knex").Knex} knex
 */
export const seed = async function (knex) {
  // Urutkan dari tabel anak ke induk untuk hapus data
  const tables = ['sertifikat', 'logbook', 'pendaftaran', 'users'];

  logger.info('🔄 Menghapus semua data dari tabel...');

  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of tables) {
    await knex(table).truncate();
    logger.info(`✅ Tabel ${table} dikosongkan.`);
  }
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  logger.info('🚀 Memulai proses seeding...');

  // Jalankan seed sesuai kebutuhan
  await seedAdminOnly(knex); // Seed admin user
  await seedAllData(knex);   // Seed semua data contoh

  logger.info('🎉 Proses seeding selesai.');
};
