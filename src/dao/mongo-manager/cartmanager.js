import cartModel from "../models/cart.model.js";
import productsModel from "../models/product.model.js";

export class cartManagerDB {
  constructor() {}

  createCart = async (request, response) => {
    let id;
    let readFile = await cartModel.find();

    id = readFile.length === 0 ? 1 : readFile[readFile.length - 1].id + 1;

    await cartModel.create({
      id,
    });

    response.send("cart created");
  };

  validateParams = async (request, response) => {
    const cid = Number(request.params.cid);
    const pid = Number(request.params.pid);

    const readCartFile = await cartModel.find();
    const readProductsFile = await productsModel.find();

    const validateCid = readCartFile.find((item) => item.id === cid);
    const validatePid = readProductsFile.find((item) => item.id === pid);

    let validations = {
      validateCid: validateCid,
      validatePid: validatePid,
      pid: pid,
      cid: cid,
    };

    return validations;
  };

  getProductById = async (id, response) => {
    let search = await cartModel
      .findOne({ id: id })
      .populate("products.product")
      .lean();
    search ? search : (search = "Not found");
    return search;
  };

  addProductInCart = async (request, response) => {
    const cid = Number(request.params.cid);
    const pid = Number(request.params.pid);

    const readCartFile = await cartModel.find();
    const readProductsFile = await productsModel.find();

    const validateCid = readCartFile.find((item) => item.id === cid);
    const validatePid = readProductsFile.find((item) => item.id === pid);

    if (validateCid === undefined || validatePid === undefined) {
      response.status(400).send("Cart or product id does not exist");
      return;
    }

    const validatePidInArray = validateCid.products.find(
      (item) => item.product === Number(pid) || item._id === pid
    );

    if (validateCid.products.length === 0 || validatePidInArray === undefined) {
      await cartModel.findOneAndUpdate(validateCid._id, {
        $push: { products: [{ product: pid, quantity: 1 }] },
      });

      response.send("Cart updated successfully");
      return;
    }

    if (validatePidInArray) {
      await cartModel.findByIdAndUpdate(
        { _id: validateCid._id },
        {
          $set: {
            "products.$[element].quantity": validatePidInArray.quantity + 1,
          },
        },
        { arrayFilters: [{ "element._id": validatePidInArray._id }] }
      );

      response.send("Cart updated successfully");
      return;
    }
  };

  deleteProduct = async (request, response) => {
    const validations = await this.validateParams(request, response);

    const { validateCid, validatePid, pid, cid } = validations;

    if (validateCid === undefined || validatePid === undefined) {
      response.status(400).send("Cart or product id does not exist");
      return;
    }

    const validatePidInArray = validateCid.products.find(
      (item) => item.product === pid
    );

    if (validateCid.products.length === 0 || validatePidInArray === undefined) {
      response.send("Product does not exits in the cart");
      return;
    }

    if (validatePidInArray) {
      await cartModel.updateOne(
        { _id: validateCid._id },
        { $pull: { products: { _id: validatePidInArray._id } } }
      );

      response.send("Cart updated successfully");
      return;
    }
  };

  deleteProducts = async (request, response) => {
    const cid = Number(request.params.cid);

    const readCartFile = await cartModel.find();

    const validateCid = readCartFile.find((item) => item.id === cid);

    if (validateCid === undefined) {
      response.status(400).send("Cart does not exist");
      return;
    }

    await cartModel.updateOne({ _id: validateCid._id }, { products: [] });

    response.send("Cart updated successfully");
    return;
  };

  updateQty = async (request, response) => {
    const { quantity } = request.body;

    const validations = await this.validateParams(request, response);

    const { validateCid, validatePid, pid, cid } = validations;

    if (validateCid === undefined || validatePid === undefined) {
      response.status(400).send("Cart or product id does not exist");
      return;
    }

    const validatePidInArray = validateCid.products.find(
      (item) => item.product === pid
    );

    if (validateCid.products.length === 0 || validatePidInArray === undefined) {
      response.send("Product does not exits in the cart");
      return;
    }

    if (validatePidInArray) {
      await cartModel.findByIdAndUpdate(
        { _id: validateCid._id },
        {
          $set: {
            "products.$[element].quantity": quantity,
          },
        },
        { arrayFilters: [{ "element._id": validatePidInArray._id }] }
      );

      response.send("Cart updated successfully");
      return;
    }
  };

  updateAllCart = async (request, response) => {
    const cid = Number(request.params.cid);
    const { products } = request.body;

    const readCartFile = await cartModel.find();

    const validateCid = readCartFile.find((item) => item.id === cid);

    if (validateCid === undefined) {
      response.status(400).send("Cart does not exist");
      return;
    }

    await cartModel.updateOne({ _id: validateCid._id }, { products: products });

    response.send("Cart updated successfully");
    return;
  };
}
