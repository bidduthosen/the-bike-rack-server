const express = require('express')
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()



// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('the bike rack is running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.og8pjeq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    const categoriesCollection = client.db("bikeRackResale").collection("bikeCategories");
    const allProductsCollection = client.db('bikeRackResale').collection('allProducts');
    const bookingsCollection = client.db('bikeRackResale').collection('bookings');
    const usersCollection = client.db('bikeRackResale').collection('users');
    try{
        app.get('/categories', async(req, res)=>{
            const query = {};
            const result = await categoriesCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/categoriesId', async(req, res)=>{
            const query = {};
            const result = await categoriesCollection.find(query).project({categoryId : 1, categoryName: 1}).toArray();
            res.send(result);
        })

        app.get('/allproducts/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {categoryId: id}
            const result = await allProductsCollection.find(filter).toArray()
            res.send(result);

        });


        // add a products
        app.get('/addAProduct', async(req, res)=>{
            const email = req.query.email;
            const query = {ownerEmail : email};
            const product = await allProductsCollection.find(query).toArray();
            res.send(product);
        })
        app.post('/addAProduct', async(req, res)=>{
            const product = req.body;
            const result = await allProductsCollection.insertOne(product);
            res.send(result);
        });
        app.delete('/addAProduct/:id', async(req, res)=>{
            const id = req.params.id;
            console.log(id)
            const filter = {_id: ObjectId(id)};
            const result = await allProductsCollection.deleteOne(filter);
            res.send(result);
        })


        app.get('/bookings', async(req, res)=>{
            const email = req.query.email;
            const query = {email}
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        });

        app.post('/bookings', async(req, res)=>{
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });
        app.delete('/bookings/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await bookingsCollection.deleteOne(filter);
            res.send(result);
        })

        // users collections
        app.get('/users', async(req, res)=>{
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })
        app.post('/users', async(req, res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })
        app.put('/users/admin/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })


    }
    finally{

    }

}
run().catch(err=> console.log(err))

app.listen(port, () => {
  console.log(`the bike rack is running on port ${port}`)
})