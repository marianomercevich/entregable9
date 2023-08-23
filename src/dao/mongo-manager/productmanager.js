import productsModel from "../models/product.model.js";

export class MongoDBProductManager {
  constructor() {}

  validateData = (argumentToValidate, stringToShow) => {
    if (argumentToValidate) {
      console.log(stringToShow);
      return;
    }
  };

  readProductsDB = async () => {
    return await productsModel.find();
  };

  limitHandler = async (request, response) => {
    const limit = Number(request.query.limit) || 10;
    const page = Number(request.query.page) || 1;
    const query = request.query.query || "";
    const sort = Number(request.query.sort) || "";

    const result = await productsModel.paginate(
      {},
      { page, limit, lean: true }
    );

    if (sort === 1) {
      const sortedDocsAsc = result.docs.sort((a, b) => a.price - b.price);
      result.docs = sortedDocsAsc;
    } else if (sort === -1) {
      const sortedDocsDesc = result.docs.sort((a, b) => b.price - a.price);
      result.docs = sortedDocsDesc;
    }

    if (query) {
      const filtrado = result.docs.filter((item) => item.category === query);
      result.docs = filtrado;
    }

    result.prevLink = result.hasPrevPage
      ? `/products/?limit=${limit}&page=${result.prevPage}&sort=${sort}&query=${query}`
      : null;
    result.nextLink = result.hasNextPage
      ? `/products/?limit=${limit}&page=${result.nextPage}&sort=${sort}&query=${query}`
      : null;

    const resultToSend = {
      status: "success",
      payload: { docs: result.docs },
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.prevLink,
      nextLink: result.nextLink,
    };

    return resultToSend;
  };

  addProduct = async (request, response) => {
    const {
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
      category,
      status,
    } = request.body;

    if (typeof status != "boolean") {
      response.status(400).send("status must be boolean");
      return;
    }

    if (!title || !description || !price || !stock || !code || !category) {
      response.status(400).send("At least one field is missing");
      return;
    }

    let readFile = await this.readProductsDB();

    const validateCode = readFile.find((el) => el.code === code);

    if (validateCode) {
      response.status(400).send("Code indicated already exits");
      return;
    }

    let id;

    id = readFile.length === 0 ? 1 : readFile[readFile.length - 1].id + 1;

    let newItemInDB = await productsModel.create({
      id,
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
      category,
      status,
    });

    response.send({ status: "Successful request", payload: newItemInDB });
  };

  getProductById = async (id, response) => {
    let readFile = await this.readProductsDB();

    let search = readFile.find((el) => el.id === id);

    search ? search : (search = "Not found");

    response.send(search);
  };

  updateProduct = async (request, response) => {
    const id = Number(request.params.pid);

    const {
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
      category,
      status,
    } = request.body;

    let readFileToUpdate = await this.readProductsDB();

    const itemFounded = readFileToUpdate.filter((item) => item.id === id);

    this.validateData(!itemFounded, "id not found");

    for (const document of itemFounded) {
      console.log("Documento:", document);
      const { _id } = document;

      const nuevoItem = {
        id: id,
        title: title,
        description: description,
        price: price,
        thumbnail: [thumbnail],
        code: code,
        stock: stock,
        category: category,
        status: status,
      };

      await productsModel.findOneAndUpdate(_id, nuevoItem);
    }

    response.send("Successful request");
  };

  deleteProduct = async (request, response) => {
    const id = Number(request.params.pid);

    const readFile = await this.readProductsDB();

    const itemToDelete = readFile.find((item) => item.id === id);

    if (itemToDelete === undefined) {
      response
        .status(400)
        .send(
          "Something went wrong: id did not exist on the list, try with another one"
        );
      return;
    }

    await productsModel.deleteOne(itemToDelete._id);

    response.send({ status: "Id deleted succesfully", payload: itemToDelete });
  };
}
