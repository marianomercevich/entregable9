import userModel from "../models/user.model.js";
import productsModel from "../models/product.model.js";

export class userManager {
  constructor() {}

  readBD = async () => {
    return await userModel.find();
  };

  registerUser = async (request, response) => {
    const { first_name, last_name, email, age, password } = request.body;

    let validateData = await this.readBD();
    const validateEmail = validateData.filter((item) => item.email === email);

    if (validateEmail.length === 1) {
      response.status(400).json({ message: "usuario ya existe" });
      return;
    }

    await userModel.create({
      first_name,
      last_name,
      email,
      age,
      password,
      role: "usuario",
    });

    response.redirect("/api/sessions/login");
  };

  loginSession = async (request, response) => {
    const { email, password } = request.body;
    let validateData = await this.readBD();

    const validateEmailExits = validateData.filter(
      (item) => item.email === email
    );

    if (validateEmailExits.length === 0) {
      response.redirect("/api/sessions/registro");
      return;
    }

    const validateEmailAndPassword = validateData.find(
      (item) => item.email === email && item.password === password
    );

    if (validateEmailAndPassword === undefined) {
      response.status(400).json({
        message: "Usuario o contrase*a incorrecto",
      });
      return;
    }

    const user = {
      email: email,
    };

    request.session.user = user;
    response.redirect("/api/sessions/view");
  };

  logoutSession = async (request, response) => {
    request.session.destroy((err) => {
      if (err)
        return response.json({ status: "error", message: "Ocurrio un error" });
      else {
        response.redirect("/api/sessions/login");
      }
    });
  };

  loginHandler = async (request, response) => {
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
      ? `/api/sessions/view/?limit=${limit}&page=${result.prevPage}&sort=${sort}&query=${query}`
      : null;
    result.nextLink = result.hasNextPage
      ? `/api/sessions/view/?limit=${limit}&page=${result.nextPage}&sort=${sort}&query=${query}`
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

    let readDB = await this.readBD();

    const userEmail = request.session.user.email;

    const searchUser = readDB.filter((item) => item.email === userEmail);

    let userRole = "";

    for (const iterator of searchUser) {
      userRole = iterator.role;
    }

    const usuario = { user: userEmail, role: userRole };

    resultToSend.users = usuario;

    response.render("products", resultToSend);
  };
}

export default userManager;
