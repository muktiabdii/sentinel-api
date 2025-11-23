/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE products
    ALTER COLUMN image TYPE TEXT[] USING ARRAY[image],
    ALTER COLUMN color TYPE TEXT[] USING ARRAY[color],
    ALTER COLUMN memory TYPE TEXT[] USING ARRAY[memory];
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE products
    ALTER COLUMN image TYPE TEXT USING image[1],
    ALTER COLUMN color TYPE TEXT USING color[1],
    ALTER COLUMN memory TYPE TEXT USING memory[1];
  `);
};