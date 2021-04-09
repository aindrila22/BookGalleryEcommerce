const Order = require("../../../models/order");
const moment = require("moment");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

function orderController() {
  return {
    store(req, res) {
      //Validate request
      const { phone, address, stripeToken, paymentType } = req.body;
      if (!phone || !address) {
        return res.status(422).json({ message: "All fields are required" });
      }

      const order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone,
        address,
      });

      order
        .save()
        .then((result) => {
          Order.populate(result, { path: "customerId" }, (err, placedOrder) => {
            //Stripe Payment
            if (paymentType === "card") {
              stripe.charges
                .create({
                  amount: req.session.cart.totalPrice * 100,
                  source: stripeToken,
                  currency: "inr",
                  description: `Book Order: ${placedOrder._id}`,
                })
                .then(() => {
                  placedOrder.paymentStatus = true;
                  placedOrder.paymentType = paymentType;
                  placedOrder
                    .save()
                    .then((ord) => {
                      //Emit
                      const eventEmitter = req.app.get("eventEmitter");
                      eventEmitter.emit("orderPlaced", ord);
                      delete req.session.cart;
                      return res.json({
                        message: "Payment is successful & Order is placed ",
                      });
                    })
                    .catch((er) => {
                      console.log(er);
                    });
                })
                .catch((e) => {
                  delete req.session.cart;
                  return res.json({
                    message: "Order Placed but Payment failed ",
                  });
                });
            } else {
              delete req.session.cart;
              return res.json({
                message: "Order Placed Successfully ",
              });
            }
          });
        })
        .catch((err) => {
          return res.status(500).json({
            message: "Something went wrong",
          });
        });
    },

    async index(req, res) {
      const orders = await Order.find({ customerId: req.user._id }, null, {
        sort: { createdAt: -1 },
      });
      res.header(
        "Cache-control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
      );
      res.render("customers/orders", { orders: orders, moment: moment });
    },
    async show(req, res) {
      const order = await Order.findById(req.params._id);
      //Authorize user
      if (req.user._id.toString() === order.customerId.toString()) {
        return res.render("customers/singleOrder", { order: order });
      }
      return res.render("/");
    },
  };
}

module.exports = orderController;
