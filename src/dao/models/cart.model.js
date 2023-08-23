import mongoose from "mongoose";

const cartCollection = "carts";

const cartSchema = mongoose.Schema({
  id: { type: Number },
  products: {
    type: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
        product: { type: Number },
        quantity: { type: Number }
      },
    ]
    ,
    default: []
  },
});

cartSchema.pre('findOne', function() {
  this.populate('products.product')
})

const cartModel = mongoose.model(cartCollection, cartSchema)

export default cartModel