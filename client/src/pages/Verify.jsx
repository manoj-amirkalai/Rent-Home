import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import {toast} from 'react-toastify'
const Verify = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const customerId = searchParams.get("customerId");
  const navigate = useNavigate();
  

  const verifyPayment = async () => {
   const response= await axios.post("http://localhost:3001/bookings/updatebooking", {
      success,
      orderId,
    });
    if (response.data.success) {
      navigate(`/${customerId}/trips`)
      toast.success("Payment Success")
    } else {
      navigate(`/${customerId}/trips`)
      toast.error("Payment Failed")
    }
  };
 
  useEffect(() => {
    verifyPayment();
  },[]);
  return (
    <div className="verify">
      <div className="spinner"></div>
    </div>
  );
};

export default Verify;
