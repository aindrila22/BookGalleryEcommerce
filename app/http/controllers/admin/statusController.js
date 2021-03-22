const Order = require("../../../models/order");
function statusController() {
  return {
    update(req, res) {
      Order.updateOne(
        { _id: req.body.orderId },
        { status: req.body.status },
        (err, data) => {
          if (err) {
            return res.redirect("/admin/orders");
          }
          //event emit
          const eventEmitter = req.app.get("eventEmitter");
          eventEmitter.emit("orderUpdated", {
            _id: req.body.orderId,
            status: req.body.status,
          });
          return res.redirect("/admin/orders");
        }
      );
    },
  };
}

module.exports = statusController;
