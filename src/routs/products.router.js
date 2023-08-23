import { Router } from "express";
/* import "../assets/products.json" assert { type: "json" }; */
import { ProductManager } from "../dao/file-manager/ProductManager.js";
import { MongoDBProductManager } from "../dao/mongo-manager/productmanager.js";

const router = Router();
const manager = new ProductManager(
  "../assets/products.json"
);

const managerDB = new MongoDBProductManager()

router.get("/", async (request, response) => {
  response.send(await managerDB.limitHandler(request, response))
});

router.get("/:pid", async (request, response) => {
  const id = Number(request.params.pid);
  await managerDB.getProductById(id, response);
});

router.post("/", async (request, response) => {
  await managerDB.addProduct(request, response)
});/* aca hay un problema */

router.put("/:pid", async (request, response) => {
  await managerDB.updateProduct(request, response);
});

router.delete("/:pid", async (request, response) => {
  await managerDB.deleteProduct(request, response);
});

export default router;