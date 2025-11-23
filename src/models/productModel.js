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
    // clone data
    const dataToInsert = { ...productData };
    return db('products')
      .insert(dataToInsert)
      .returning(['id', 'image', 'name', 'description', 'price', 'color', 'memory']);
  },

  async deleteById(id) {
    return db("products").where({ id }).del().returning(["id"]);
  },
};

module.exports = Product;
