import fs, { read } from "fs";

export class ProductManager {
  #path;
  #format;
  #array;
  constructor(path) {
    this.#path = path;
    this.#format = "utf-8";
    this.#array = [];
  }

  validateData = (argumentToValidate, stringToShow) => {
    if (argumentToValidate) {
      console.log(stringToShow);
      return;
    }
  };

  orderArray = (arrayToOrder) => {
    arrayToOrder.sort((a, b) => {
      if (a.id > b.id) {
        return 1;
      }

      if (a.id < b.id) {
        return -1;
      }

      return 0;
    });

    this.writeFileFunction(arrayToOrder);
  };

  readJSON = async () => {
    return JSON.parse(await fs.promises.readFile(this.#path, this.#format));
  };

  writeFileFunction = async (array) => {
    await fs.promises.writeFile(this.#path, JSON.stringify(array, null, "\t"));
  };

  limitHandler = async (request, response) => {
    const limit = Number(request.query.limit);

    const readFile = await this.readJSON();

    if (limit < 0) {
      response.status(400).send("limit invalid");
      return;
    }

    if (!limit) {
      response.send(readFile);
      return;
    }

    const limitFilter = readFile.slice(0, limit);

    response.send(limitFilter);
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

    let readFile = await this.readJSON();

    const validateCode = readFile.find((el) => el.code === code);

    if (validateCode) {
      response.status(400).send("Code indicated already exits");
      return;
    }

    // this.addProduct( title, description, price, thumbnail, code, stock, category, status );

    let id;

    // let readFile = await this.readJSON();

    id = readFile.length === 0 ? 1 : readFile[readFile.length - 1].id + 1;

    let array = [];

    array.push({
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

    const nuevoItem = {
      id: id,
      title: title,
      description: description,
      price: price,
      thumbnail: thumbnail,
      code: code,
      stock: stock,
      category: category,
      status: status,
    };
    let newArray;

    if (readFile.length === 0) {
      try {
        this.writeFileFunction(array);
      } catch (error) {
        console.error("ha ocurrido un error con el archivo", error);
      }
    } else {
      newArray = [...readFile, nuevoItem];

      this.orderArray(newArray);

      this.writeFileFunction(newArray);
    }

    response.send("Successful request");
  };

  getProduct = async () => {
    this.validateData(!fs.existsSync(this.#path), "file not found");

    try {
      let readFile = await this.readJSON();
      console.log(readFile);
    } catch (error) {
      console.error(error);
    }
  };

  getProductById = async (id, response) => {
    
    this.validateData(!fs.existsSync(this.#path), "file not found");
    
    let readFile = await this.readJSON();
    
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

    this.validateData(!fs.existsSync(this.#path), "file not found");

    let readdFileToUpdate = await this.readJSON();

    const itemFounded = readdFileToUpdate.filter((item) => item.id === id);

    this.validateData(!itemFounded, "id not found");

    const nuevoItem = {
      id: id,
      title: title,
      description: description,
      price: price,
      thumbnail: thumbnail,
      code: code,
      stock: stock,
      category: category,
      status: status,
    };

    const otherItemInArray = readdFileToUpdate.filter((item) => item.id != id);

    let newArray;

    if (otherItemInArray.length === 0) {
      newArray = [nuevoItem];

      this.writeFileFunction(newArray);

      this.getProduct();
    } else {
      newArray = [...otherItemInArray, nuevoItem];

      this.orderArray(newArray);
    }

    response.send("Successful request");
  };

  deleteProduct = async (request, response) => {
    const id = Number(request.params.pid);
  
    this.validateData(!fs.existsSync(this.#path), "file not found");
    
    const readFile = await this.readJSON();
    
    const deleteItem = readFile.find((item) => item.id === id);
    
    if(!deleteItem){
      response.status(400).send("Something went wrong: id did not exist on the list, try with another one")
      return
    }

    let newArray = readFile.filter((item) => item.id != id);
    
    this.#array.push(newArray);
    
    this.writeFileFunction(newArray);

    response.send("Id deleted succesfully");
  };

  addProductInCart = async (request, response) => {

    const cid = Number(request.params.cid);
    const pid = Number(request.params.pid);
  
    const readCartFile = await this.readJSON();
    const readProductsFile = JSON.parse(
      await fs.promises.readFile(
        "../assets/products.json",
        "utf-8"
      )
    );
  
    const validateCid = await readCartFile.find((item) => item.id === cid);
    const validatePid = await readProductsFile.find((item) => item.id === pid);
  
    if (validateCid === undefined || validatePid === undefined) {
      response.status(400).send("Cart or product id does not exist");
      return;
    }
  
    const itemsCurrentCart = await readCartFile.filter((item) => item.id != cid);
  
    const validatePidInArray = validateCid.products.find((item) => item.product === pid);
  
    const otherProductsInCart = validateCid.products.filter((item) => item.product != pid);
  
    let itemUpdated;
    let newCartContent;
  
    if (validateCid.products.length === 0) {
      itemUpdated = { id: cid, products: [{ product: pid, quantity: 1 }] };
  
      newCartContent = [...itemsCurrentCart, itemUpdated];
  
      this.orderArray(newCartContent)
  
      response.send('Cart updated successfully') 
      return;
    }
  
    if (validatePidInArray === undefined) {
      let productsInCart = await validateCid.products;
        
      itemUpdated = { id: cid, products: [...productsInCart, { product: pid, quantity: 1 }]};
  
      newCartContent = [...itemsCurrentCart, itemUpdated];
  
      this.orderArray(newCartContent)
  
      response.send('Cart updated successfully')
  
      return;
    }
  
    if (validatePidInArray) {
      let newProductContent = { id: cid, products: [ ...otherProductsInCart, { product: pid, quantity: validatePidInArray.quantity + 1 }]};
  
      newCartContent = [...itemsCurrentCart, newProductContent];
  
      this.orderArray(newCartContent)
  
      response.send('Cart updated successfully')
  
    }
  }

  createCart = async (request, response) => {

    let id;
    let readFile = await this.readJSON();
  
    id = readFile.length === 0 ? 1 : readFile[readFile.length - 1].id + 1;
  
    let emptyArray = [];
  
    const arrayToAdd = {
      id: id,
      products: [],
    };
  
    emptyArray.push(arrayToAdd);
  
    const nuevoItem = arrayToAdd;
  
    let newArray;
  
    if (readFile.length === 0) {
  
      try {
        this.writeFileFunction(emptyArray);
      } catch (error) {
        console.error("ha ocurrido un error con el archivo", error);
      }
  
    } else {
      newArray = [...readFile, nuevoItem];
  
      this.orderArray(newArray)
    }
  
    response.send("cart created");
  }
}
