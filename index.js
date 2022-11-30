const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
const whitelist = ['http://localhost:3000', 'https://resale-mobile.web.app']
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
}
app.use(cors(corsOptions))


app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);

//mongodb connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wkoqaez.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    console.log(req.headers.authorization);
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

        // verifyAdmin function
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }

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

        // reported get api

        app.get('/reporteds', async (req, res) => {
            const query = { reported: 'reported' }
            const items = await productCollection.find(query).toArray();
            res.send(items);
        })

        //reported post api
        app.put('/products/reporteds/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    reported: 'reported'
                }
            }
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        //reported delete api
        app.delete('/reporteds/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(filter)
            res.send(result);
        })

        //Addproduct api for post
        app.post('/addproduct', async (req, res) => {
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

        //myproduct delete api
        app.delete('/myproduct/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(filter)
            res.send(result);
        })

        //advertise get api
        app.get('/advertises', async (req, res) => {
            const query = { advertise: 'advertise' }
            const items = await productCollection.find(query).toArray();
            res.send(items);
        })

        //addvertise put api
        app.put('/myproduct/advertise/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    advertise: 'advertise'
                }
            }
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });


        // booking get api for my orders
        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            // console.log(req.headers.authorization);
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            const query = { email: email }
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        })

        //booking post api
        app.post('/bookings', verifyJWT, async (req, res) => {
            const bookings = req.body;
            const result = await bookingCollection.insertOne(bookings);
            res.send(result);
        })



        //jwt
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            console.log(user);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '30d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

        //all users
        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result)
        })

        // app.put('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) }
        //     const options = { upsert: true };
        //     const updatedDoc = {
        //         $set: {
        //             role: 'admin'
        //         }
        //     }
        //     const result = await userCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        // });

        //admin route
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        //users based on seller
        app.get('/sellers', async (req, res) => {
            // const role = req.query.role;
            const query = { role: 'Seller' }
            const sellers = await userCollection.find(query).toArray();
            res.send(sellers);
        })

        // seller route
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isSeller: user?.role === 'Seller' });
        })

        //seller verify get api 
        app.get('/verifyseller', async (req, res) => {
            const query = { verify: 'verify' }
            const items = await userCollection.find(query).toArray();
            res.send(items);
        })

        //seller verify post api
        app.put('/sellers/verify/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verify: 'verify'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        // users based on buyer
        app.get('/allbuyers', verifyJWT, async (req, res) => {
            // const role = req.query.role;
            const query = { role: 'Buyer' }
            const buyers = await userCollection.find(query).toArray();
            res.send(buyers);
        })

        // delete seller 
        app.delete('/sellers/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(filter)
            res.send(result);
        })

        // buyer delete api

        app.delete('/allbuyers/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(filter)
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