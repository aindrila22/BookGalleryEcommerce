import axios from "axios";
import moment from "moment";
import Noty from "noty";
import initAdmin from "./admin";

let addToCart = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector("#cartCounter");

function updateCart(books) {
  axios
    .post("/update-cart", books)
    .then((res) => {
      console.log(res);
      cartCounter.innerText = res.data.totalQty;
      new Noty({
        type: "information",
        timeout: 1000,
        text: "Book added to cart",
        progressBar: false,
      }).show();
    })
    .catch((err) => {
      new Noty({
        type: "error",
        timeout: 1000,
        text: "Something went wrong",
        progressBar: false,
      }).show();
    });
}

addToCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let books = JSON.parse(btn.dataset.books);
    updateCart(books);
  });
});

const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 2000);
}

// status update
const statuses = document.querySelectorAll(".status_line");
const hiddenInput = document.querySelector("#hiddenInput");
const order = hiddenInput ? hiddenInput.value : null;
const orders = JSON.parse(order);
let time = document.createElement("small");

function updateStatus(orders) {
  statuses.forEach((status) => {
    status.classList.remove("step-completed");
    status.classList.remove("current");
  });
  let completed = true;
  statuses.forEach((status) => {
    let dataProp = status.dataset.status;
    if (completed) {
      status.classList.add("step-completed");
    }
    if (dataProp === orders.status) {
      completed = false;
      time.innerText = moment(order.updatedAt).format(
        "MMMM DD , YYYY  on  hh:mm A"
      );
      status.appendChild(time);
      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add("current");
      }
    }
  });
}
updateStatus(orders);

//Socket
let socket = io();

//Join
if (orders) {
  socket.emit("join", `order_${orders._id}`);
}

let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes("admin")) {
  initAdmin(socket);
  socket.emit("join", "adminRoom");
}
socket.on("orderUpdated", (data) => {
  const updatedOrder = { ...orders };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;
  updateStatus(updatedOrder);
  new Noty({
    type: "success",
    timeout: 1000,
    text: "Order Updated",
    progressBar: false,
  }).show();
});
