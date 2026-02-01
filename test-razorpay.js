const Razorpay = require("razorpay");
console.log("Razorpay loaded successfully");
try {
  const instance = new Razorpay({
    key_id: "rzp_test_123",
    key_secret: "secret",
  });
  console.log("Razorpay instance created successfully");
} catch (e) {
  console.error("Error creating Razorpay instance:", e);
}
