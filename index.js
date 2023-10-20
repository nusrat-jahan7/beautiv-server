const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Midleware call
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const Brands = client.db("beautiv-db").collection("brands");
  const Products = client.db("beautiv-db").collection("products");
  const Cart = client.db("beautiv-db").collection("cart");

  try {
    // get brands
    app.get("/brands", async (req, res) => {
      const data = Brands.find({});
      const result = await data.toArray();
      res.send({
        success: true,
        message: "Brands retrieve successfully",
        data: result,
      });
    });

    // get products by brand
    app.get("/products/:slug", async (req, res) => {
      const { slug } = req.params;
      const data = Products.find({ brand_slug: slug });
      const result = await data.toArray();
      res.send({
        success: true,
        message: "Products retrieve successfully",
        data: result,
      });
    });

    // add new product
    app.post("/products", async (req, res) => {
      const data = req.body;
      const result = await Products.insertOne(data);
      res.send({
        success: true,
        message: "Product add successfully",
        data: result,
      });
    });

    // get a product
    app.get("/products/:slug/:id", async (req, res) => {
      const { id } = req.params;
      const result = await Products.findOne({ _id: new ObjectId(id) });
      res.send({
        success: true,
        message: "Product retrieve successfully",
        data: result,
      });
    });

    // edit a product
    app.patch("/products/:id", async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const update = {
        $set: updatedData,
      };
      const options = { upsert: true };
      const result = await Products.updateOne(filter, update, options);
      res.send({
        success: true,
        message: "Product update successfully",
        data: result,
      });
    });

    // delete a product
    app.delete("/products/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await Products.deleteOne(filter);
      res.send({
        success: true,
        message: "Product delete successfully",
        data: result,
      });
    });

    // get cart by user email
    app.get("/cart/:email", async (req, res) => {
      const { email } = req.params;
      const data = Cart.find({ email });
      const result = await data.toArray();
      res.send({
        success: true,
        message: "Cart retrieve successfully",
        data: result,
      });
    });

    // add cart for a user
    app.post("/cart", async (req, res) => {
      const data = req.body;
      data.product.quantity = 1;
      const result = await Cart.insertOne(data);
      res.send({
        success: true,
        message: "Successfully added",
        data: result,
      });
    });

    // update a product cart quantity
    app.put("/cart/:id", async (req, res) => {
      const { id } = req.params;
      const quantity = req.body.quantity;
      const filter = { _id: new ObjectId(id) };
      const update = {
        $set: {
          "product.quantity": quantity,
        },
      };
      const options = { upsert: true };
      const result = await Cart.updateOne(filter, update, options);
      res.send({
        success: true,
        message: "Cart update successfully",
        data: result,
      });
    });

    // delete a cart
    app.delete("/cart/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await Cart.deleteOne(filter);
      res.send({
        success: true,
        message: "Cart delete successfully",
        data: result,
      });
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Mongodb Database connected successfully!");
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Beautiv server running on port ${port}`);
});
