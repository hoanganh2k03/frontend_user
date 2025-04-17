import React, { useEffect } from 'react';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Verify = () => {
  const { navigate, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem('token') || useContext(ShopContext).token;
  const success = searchParams.get('success'); // Dùng cho Stripe
  const orderId = searchParams.get('orderId');
  const resultCode = searchParams.get('resultCode'); // Dùng cho MoMo

  const verifyPayment = async () => {
    console.log("TOKEN IS"+token)
    try {
      if (!token) {
        toast.error('Please login HUHU to verify payment');
        navigate('/login');
        return;
      }

      if (!orderId) {
        toast.error('Invalid payment verification request');
        navigate('/cart');
        return;
      }

      let response;

      // Xử lý MoMo
      if (resultCode !== null) {
        // MoMo redirect với resultCode
        response = await axios.post(
          `${backendUrl}/api/order1/verifyMomo`,
          { orderId },
          { headers: { token } }
        );

        if (response.data.success) {
          setCartItems({});
          toast.success('Payment successful!');
          navigate('/orders');
        } else {
          toast.error('Payment failed: ' + response.data.message);
          navigate('/cart');
        }
      }
      // Xử lý Stripe
      else if (success !== null) {
        response = await axios.post(
          `${backendUrl}/api/order1/verifyStripe`,
          { success, orderId },
          { headers: { token } }
        );

        if (response.data.success) {
          setCartItems({});
          toast.success('Payment successful!');
          navigate('/orders');
        } else {
          toast.error('Payment failed');
          navigate('/cart');
        }
      } else {
        toast.error('Invalid payment verification request');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error(error.response?.data?.message || error.message);
      navigate('/cart');
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [token]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Verifying Payment...</h2>
        <p className="text-gray-500">Please wait while we verify your payment.</p>
      </div>
    </div>
  );
};

export default Verify;