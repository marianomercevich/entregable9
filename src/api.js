import express from 'express';
import handlebars from 'express-handlebars';
import productsRouter from './routs/products.router.js';
import cartsRouter from './routs/carts.router.js';
/* import viewRouter from './routs/views.router.js'; */
import mongoose, {mongo} from 'mongoose';
import MongoStore from 'connect-mongo'
import session from "express-session";
import sessionsRouter from "./routs/sessions.router.js";
import InitializePassport from './config/passport.config.js';
import passport from 'passport';

const app = express();


app.use(express.json());
app.engine('handlebars', handlebars.engine());
app.set('views', './src/views');
app.set('view engine', 'handlebars');
app.use(express.static('./src/public'));
app.use(express.urlencoded({ extended: true }));

app.use(session({ store: MongoStore.create({
      mongoUrl: 'mongodb+srv://CoderUser:123@cluster0.ghinxw0.mongodb.net',
      dbName: 'sessions',
      mongoOptions: {
          useNewUrlParser: true,
          useUnifiedTopology: true
      } }),
  secret: 'victoriasecret',
  resave: true,
  saveUninitialized: true
}))

InitializePassport()
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => res.render('index'));
/* app.use('/products', viewRouter); */
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use("/api/sessions", sessionsRouter)

await mongoose.connect(
    "mongodb+srv://CoderUser:123@cluster0.ghinxw0.mongodb.net/ProyectoFinal"
);
const httpServer = app.listen(8080, () => console.log('Server Up'));
