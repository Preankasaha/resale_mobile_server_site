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

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}

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


        // products by category api with category/:id route

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { categoryId: id }
            const products = await productCollection.find(query).toArray();
            res.send(products);
        })

         //all products
        // app.get('/category', async (req, res) => {
        //     const query = {};
        //     const products = await productCollection.find(query).toArray();
        //     res.send(products);
        // })

    }
    finally {

    }
}
run().catch(console.log)

app.get('/', (req, res) => {
    res.send('resale mobile server is running')
})
app.listen(port, () => console.log(`resale mobile is running on ${port}`))