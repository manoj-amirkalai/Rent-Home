import { useState } from "react";
import axios from "axios";
import "../styles/ListingCard.scss";
import {
  ArrowForwardIos,
  ArrowBackIosNew,
  Favorite,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setWishList, setTripList } from "../redux/state";
import { toast } from "react-toastify";

const ListingCard = ({
  listingId,
  customerId,
  orderId,
  creator,
  listingPhotoPaths,
  city,
  province,
  country,
  category,
  type,
  price,
  startDate,
  endDate,
  totalPrice,
  booking,
  paid,
}) => {
  /* SLIDER FOR IMAGES */
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevSlide = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + listingPhotoPaths.length) % listingPhotoPaths.length
    );
  };

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % listingPhotoPaths.length);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ADD TO WISHLIST */
  const user = useSelector((state) => state.user);
  const userId = useSelector((state) => state.user._id);
  const wishList = user?.wishList || [];

  const isLiked = wishList?.find((item) => item?._id === listingId);

  const patchWishList = async () => {
    if (user?._id !== creator._id) {
      const response = await fetch(
        `https://manoj-rent-home-backend.onrender.com/users/${user?._id}/${listingId}`,
        {
          method: "PATCH",
          header: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      dispatch(setWishList(data.wishList));
    } else {
      return;
    }
  };

  const retryPayment = async () => {
    
    await axios.post(
      "https://manoj-rent-home-backend.onrender.com/bookings/delete",

      { orderId: orderId }
    );
  };
  const deleteOrder = async () => {
    try {
      await axios.post(
        "https://manoj-rent-home-backend.onrender.com/bookings/delete",

        { orderId: orderId }
      );
      const response = await fetch(
        `https://manoj-rent-home-backend.onrender.com/users/${userId}/trips`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      dispatch(setTripList(data));
    } catch (err) {
      toast.info("Fetch Trip List failed!");
    }
  };

  return (
    <div div className="listing-card">
      <div
        onClick={() => {
          navigate(`/properties/${listingId}`);
        }}
      >
        <div className="slider-container">
          <div
            className="slider"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {listingPhotoPaths?.map((photo, index) => (
              <div key={index} className="slide">
                <img
                  src={`https://manoj-rent-home-backend.onrender.com/${photo?.replace(
                    "public",
                    ""
                  )}`}
                  alt={`photo ${index + 1}`}
                />
                <div
                  className="prev-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevSlide(e);
                  }}
                >
                  <ArrowBackIosNew sx={{ fontSize: "15px" }} />
                </div>
                <div
                  className="next-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextSlide(e);
                  }}
                >
                  <ArrowForwardIos sx={{ fontSize: "15px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <h3>
          {city}, {province}, {country}
        </h3>
        <p>{category}</p>

        <button
          className="favorite"
          onClick={(e) => {
            e.stopPropagation();
            patchWishList();
          }}
        >
          {isLiked ? (
            <Favorite sx={{ color: "red" }} />
          ) : (
            <Favorite sx={{ color: "white" }} />
          )}
        </button>
      </div>
      {!booking ? (
        <>
          <p>{type}</p>
          <p>
            <span style={{ color: "rgb(24, 73, 152)" }}>${price}</span> per
            night
          </p>
        </>
      ) : paid ? (
        <>
          <p>
            {startDate} - {endDate}
          </p>
          <p>
            <span style={{ color: "green" }}>${totalPrice}</span>
          </p>
        </>
      ) : (
        <>
          <p>
            {startDate} - {endDate}
          </p>
          <p>
            <span style={{ color: "red" }}>${totalPrice}</span> &nbsp;
            <span onClick={() => retryPayment()}>Book Again</span>&nbsp;&nbsp;
            <span onClick={() => deleteOrder()} style={{ color: "red" }}>
              X
            </span>
            &nbsp;&nbsp;
          </p>
        </>
      )}
    </div>
  );
};

export default ListingCard;
