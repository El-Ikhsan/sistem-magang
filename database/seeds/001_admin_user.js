import bcrypt from 'bcryptjs';

/**
 * @param {import('knex').Knex} knex
 */
export const seed = async function(knex) {
  // Delete existing admin users
  await knex('users').where('role', 'admin').del();

  // Hash password
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);

  // Insert admin user
  await knex('users').insert([
    {
      name: 'Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@magang.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    }
  ]);
};
