const router = require("express").Router();

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");
const { message } = require("prompt");

/* CREATE BOOKING */
router.post("/create", async (req, res) => {
  try {
    const { customerId, hostId, listingId, startDate, endDate, totalPrice } =
      req.body;
    const newBooking = new Booking({
      customerId,
      hostId,
      listingId,
      startDate,
      endDate,
      totalPrice,
      paid: false,
    });
    await newBooking.save();
    const line_items = [];
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Total Amount",
        },
        unit_amount: totalPrice * 100 * 80,
      },
      quantity: 1,
    });
    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${process.env.FRONT_END_URL}/verify?success=true&orderId=${newBooking._id}&customerId=${newBooking.customerId}`,
      cancel_url: `${process.env.FRONT_END_URL}/verify?success=false&orderId=${newBooking._id}&customerId=${newBooking.customerId}`,
    });
    res.status(200).json({ session_url: session.url });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Fail to create a new Booking!", error: err.message });
  }
});
router.post("/updatebooking", async (req, res) => {
  const { success, orderId } = req.body;
  try {
    if (success == "true") {
      await Booking.findByIdAndUpdate(orderId, { paid: true });
      res.json({ success: true, message: "Paid" });
    } else {
      // await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
});
router.post("/delete", async (req, res) => {
  const { orderId } = req.body;
  try {
    await Booking.findOneAndDelete({ _id: orderId });
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.json({ success: false, message: "Not Removed" });
  }
});
module.exports = router;
