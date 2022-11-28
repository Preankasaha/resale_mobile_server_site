const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);

//mongodb connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wkoqaez.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {

        //db collection
        const categoryCollection = client.db('mobileResale').collection('categoriesName');
        const productCollection = client.db('mobileResale').collection('productsCollection');
        const bookingCollection = client.db('mobileResale').collection('bookings')
        const userCollection = client.db('mobileResale').collection('users')

       
        //get category api
        app.get('/products-category', async (req, res) => {
            const query = {};
            const categories = await categoryCollection.find(query).toArray();
            res.send(categories);
        })

        //all products
        // app.get('/category', async (req, res) => {
        //     const query = {};
        //     const products = await productCollection.find(query).toArray();
        //     res.send(products);
        // })

        // products by category api with category/:id route

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { categoryId: id }
            const products = await productCollection.find(query).toArray();
            res.send(products);
        })

        //single product api
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const products = await productCollection.find(query).toArray();
            res.send(products);
        })

        //Addproduct api for post
        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        })

        //myproduct get api my 
        app.get('/myproduct', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const myProduct = await productCollection.find(query).toArray();
            res.send(myProduct);
        })

        // booking get api for my orders
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        })

        //booking post api
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            const result = await bookingCollection.insertOne(bookings);
            res.send(result);
        })
        

    }
    finally {

    }
}
run().catch(console.log)

app.get('/', (req, res) => {
    res.send('resale mobile server is running')
})
app.listen(port, () => console.log(`resale mobile is running on ${port}`))