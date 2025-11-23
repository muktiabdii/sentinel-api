const db = require("../config/db");

const Product = {
  // fetch all products
  findAll() {
    return db("products").select(
      "id",
      "image",
      "name",
      "memory",
      "color",
      "price"
    );
  },

  // fetch product by id
  findById(id) {
    return db("products")
      .select("id", "image", "name", "description", "price", "color", "memory")
      .where({ id })
      .first();
  },

  // fetch multiple products by an array of ids
  findByIds(ids) {
    return db("products")
      .whereIn("id", ids)
      .select("id", "price", "name", "sku", "warranty_period_months");
  },

  // create new product
  async create(productData) {
    const dataToInsert = { ...productData };

    if (Array.isArray(dataToInsert.color)) {
      dataToInsert.color = JSON.stringify(dataToInsert.color);
    }
    if (Array.isArray(dataToInsert.memory)) {
      dataToInsert.memory = JSON.stringify(dataToInsert.memory);
    }
    if (Array.isArray(dataToInsert.image)) {
      dataToInsert.image = JSON.stringify(dataToInsert.image);
    }

    return db("products")
      .insert(dataToInsert)
      .returning(["id", "image", "name", "price", "color", "memory"]);
  },

  async deleteById(id) {
    return db("products").where({ id }).del().returning(["id"]);
  },
};

module.exports = Product;
