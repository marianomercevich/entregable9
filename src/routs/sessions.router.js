import { Router } from "express";
import { userManager } from "../dao/mongo-manager/users.manager.js";
import passport from "passport";

const router = Router();
const managerUser = new userManager();

router.get("/registro", async (request, response) => {
  response.render("registro");
});

router.post("/registro", passport.authenticate("register", {failureRedirect: "/api/sessions/failRegister",}),
  async (request, response) => {
    response.redirect("/api/sessions/login");
  }
);

router.get("/failRegister", async (request, response) => {
  response.send("el usuario registrado ya existe");
});

router.get("/login", async (request, response) => {
  response.render("login");
});

router.post("/login", async (request, response) => {
  await managerUser.loginSession(request, response);
});

router.post("/logout", async (request, response) => {
  await managerUser.logoutSession(request, response);
});

//esta muestra la vista de productos
router.get("/view", async (request, response) => {
  await managerUser.loginHandler(request, response);
});

router.get("/github", passport.authenticate('github', { scope: ['user:email']}), async (request, response) => {
});

router.get('/githubcallback', 
    passport.authenticate('github', {failureRedirect: '/api/sessions/failRegister'}),
    async(request, response) => {
        request.session.user = request.user
        response.redirect("/api/sessions/view");
    }
)

export default router;
