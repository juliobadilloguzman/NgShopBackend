const express = require('express');
const app = express();
require('dotenv').config();
const morgan = require('morgan');
const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');
const API_URL = process.env.API_URL;
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

mongoose.connect('mongodb+srv://juliox:1112@cluster0.soyfm6l.mongodb.net/eshop-app?retryWrites=true&w=majority', { useNewUrlParser: true, 
                                                                                                                    useUnifiedTopology: true, 
                                                                                                                    serverApi: ServerApiVersion.v1,
                                                                                                                    dbName: 'eshop-app' }
                                                                                                                    )
    .then(() => {

        console.log('Database connection established');

    }).catch((error) => {

        console.error('There was en error in CONNECTING to the DB', error);

    });

const PORT = 3000;

app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());
app.use(authJwt());

//Routes
const categoriesRoutes = require('./routes/categories.route');
const productsRoutes = require('./routes/products.route');
const usersRoutes = require('./routes/users.route');
const ordersRoutes = require('./routes/orders.route');


app.use(`${API_URL}/categories`, categoriesRoutes);
app.use(`${API_URL}/products`, productsRoutes);
app.use(`${API_URL}/users`, usersRoutes);
app.use(`${API_URL}/orders`, ordersRoutes);
app.use(errorHandler);

app.listen(PORT, () => {

    console.log(`Server is running at ${PORT}`);

});