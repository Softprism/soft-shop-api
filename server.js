import express from 'express';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorMiddleware.js';
import cors from 'cors';
// import { jwt } from './middleware/jwtMiddleware.js';

import connectDB from './config/db.js';

import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import productRoutes from './routes/product.routes.js';
import storeRoutes from './routes/store.routes.js';
import orderRoutes from './routes/order.routes.js';

dotenv.config();

connectDB();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// use JWT auth to secure the api
// app.use(jwt());

app.use('/users', userRoutes);
app.use('/admins', adminRoutes);
app.use('/products', productRoutes);
app.use('/stores', storeRoutes);
app.use('/order', orderRoutes);


// api routes
// app.use('/admin', require('./controllers/admin.controller'));
// app.use('/store', require('./controllers/store.controller'));
// app.use('/product', require('./controllers/product.controller'));
// app.use('/category', require('./controllers/category.controller'));

// this is just here to verify if the server is online
// app.use('/', require('./controllers/app.controller'));

app.get('/', (req, res) => {
	res.status(200).json({ success: true, msg: 'API is running...'} );
});

// global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(
	PORT,
	console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
