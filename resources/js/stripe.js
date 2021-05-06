import { placeOrder } from "./apiService";
import { loadStripe } from "@stripe/stripe-js";
import { CardWidget } from "./CardWidget";
//import axios from "axios";

export async function initStripe() {
  const stripe = await loadStripe(
    "pk_test_51GtlxpBpkXDIFH0bE02QvluDIQaSDtoYNeY0qXJrSQ6iiWpOI8lbLlMNrsImSKlXNCyyrP4GLc4TvlkPca4QI4xI00gJxfnjYb"
  );
  let card = null;
  // function mountWidget() {
  //   const elements = stripe.elements();
  //   let style = {
  //     base: {
  //       color: "#32325d",
  //       fontFamily: '"Helvetica Neue" Helvetica sans-serif',
  //       fontSmoothing: "antialiased",
  //       fontSize: "16px",
  //       "::placeholder": {
  //         color: "#aab7c4",
  //       },
  //     },
  //     invalid: {
  //       color: "#fa755a",
  //       iconColor: "#fa755a",
  //     },
  //   };
  //   card = elements.create("card", { style, hidePostalCode: true });
  //   card.mount("#card-element");
  // }
  //mountWidget();

  const paymentType = document.querySelector("#paymentType");
  if (!paymentType) {
    return;
  }
  paymentType.addEventListener("change", (e) => {
    if (e.target.value === "card") {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
      card = new CardWidget(stripe);
      card.mount();
      //mountWidget();
    } else {
      card.destroy();
    }
  });
  //Ajax Call
  const paymentForm = document.querySelector("#payment");
  if (paymentForm) {
    paymentForm.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      let formdata = new FormData(paymentForm);
      let formObject = {};

      for (let [key, value] of formdata.entries()) {
        formObject[key] = value;
      }
      if (!card) {
        placeOrder(formObject);
        return;
      }
      const token = await card.createToken();
      formObject.stripeToken = token.id;
      placeOrder(formObject);
      //Verify Card
      // stripe
      //   .createToken(card)
      //   .then((result) => {
      //     formObject.stripeToken = result.token.id;
      //     placeOrder(formObject);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   });
    });
  }
}
//export default initStripe;
