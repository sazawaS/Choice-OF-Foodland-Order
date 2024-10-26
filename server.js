if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require("express");
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
  name: {
    type: String,
  }, 
  email: {
    type: String,
  }, 
  age: {
    type: String,
  }, 
  service: {
    type: String,
  }, 
  spice: {
    type: String,
  }, 
  food: {
    type: String,
  }, 
  description: {
    type: String,
    default: ""
  }
})
const Order = mongoose.model('Order', orderSchema)


const app = express();
app.set('view engine', 'ejs')
app.use(express.urlencoded( { extended:true }))
app.use(methodOverride('_method'))

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error)); 
db.once('open', () => console.log("Database connection success"))

//Home, Order Form
app.get("/", (req, res) => {
  res.render("index")
})
app.get("/order", (req, res) => {
  res.render("order")
})

//Creating new Order POST method
app.post("/order", (req, res) => {

  const order = new Order({
    name:         req.body.name,
    email:        req.body.email,
    age:          req.body.age,
    service:      req.body.service,
    spice:        req.body.spice,
    food:         req.body.food,
    description:  req.body.description || "",
  })

  order.save()
  .then(
    res.render("orderfinished", {text: "was sucessfully sent!"})
  )
  .catch(
    res.render("orderfinished", {text: "was not submitted!"})
  )
  
})

//Password for orders view
app.get("/kitchen", (req, res) => {
  res.render('password')
})

//All orders view
app.get("/kitchen/orders", async (req,res) => {

  if (req.query.password == "password123") {

    try {
      const omgorders = await Order.find({})
      res.render('vieworders', {orders:omgorders})
    }
    catch {
      console.log('Failed')
    }
  } else {
  res.send('Wrong password! <a href="/kitchen">return</a>')
  }
})

app.route("/kitchen/order/:id")
.get(async (req, res) => {
    const id=req.params.id;

    try {
      const order = await Order.findById(id)
      res.render("vieworder", order)
    }
    catch {
      res.send("WARNING: ORDER WAS NOT FOUND! <a href='/kitchen/order'>View orders</a>")
    }
  })
  .delete( async(req, res) => {
    const id=req.params.id;
    try {
      await Order.findByIdAndDelete(id);
      res.redirect('/kitchen/orders?password=password123')
    }
    catch {
      res.send("WARNING: ORDER WAS NOT DELETED! <a href='/kitchen/order'>View orders</a>")
    }
    
  });




app.listen(process.env.PORT || 3000);