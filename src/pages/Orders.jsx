import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';
import Rating from 'react-rating'; // Thêm thư viện react-rating
import { assets } from '../assets/assets'; // Giả định bạn đã có star_icon và star_dull_icon

const Orders = () => {
  const { backendUrl, token, currency, navigate } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewData, setReviewData] = useState({
    rate: 0, // Bắt đầu với 0 sao
  });

  const loadOrderData = async () => {
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/order1/userorders`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        const ordersWithItems = await Promise.all(
          response.data.orders.map(async (order) => {
            const itemsResponse = await axios.get(
              `${backendUrl}/api/order1/items/${order.id}`,
              { headers: { token } }
            );
            const updatedItems = itemsResponse.data.items.map((item) => ({
              ...item,
              image: item.image && item.image[0]
                ? [`${backendUrl}${item.image[0]}`]
                : [],
            }));
            return {
              ...order,
              items: updatedItems || [],
            };
          })
        );

        // Sắp xếp đơn hàng theo created_at giảm dần (mới nhất lên đầu)
        // Backend đã sắp xếp, nhưng thêm sort ở đây để dự phòng
        const sortedOrders = ordersWithItems.sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );
        setOrders(sortedOrders);
      } else {
        console.error('Failed to load orders:', response.data.message);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  const openReviewModal = (order, item) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedOrder(null);
    setSelectedItem(null);
    setReviewData({
      rate: 0,
    });
  };

  const handleReviewChange = (value) => {
    setReviewData((prevData) => ({
      ...prevData,
      rate: value,
    }));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (reviewData.rate === 0) {
      toast.error('Please select a rating.');
      return;
    }

    try {
      console.log(selectedItem);
      const response = await axios.post(
        `${backendUrl}/api/reviews/add`,
        {
          product_id: selectedItem.product_id,
          rate: reviewData.rate,
          status: 'pending', // Trạng thái mặc định là pending
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Review submitted successfully! It will be reviewed soon.');
        closeReviewModal();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review.');
    }
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders found.</p>
        ) : (
          orders.map((order, index) => (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700"
            >
              {/* Thông tin đơn hàng */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <p className="text-sm md:text-base font-medium">
                    Order #{order.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Placed on: {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm md:text-base">
                    Total: {currency}{order.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                    <p className="text-sm md:text-base">{order.status}</p>
                  </div>
                  <button
                    onClick={loadOrderData}
                    className="border px-4 py-2 text-sm font-medium rounded-sm"
                  >
                    Refresh Status
                  </button>
                </div>
              </div>

              {/* Danh sách sản phẩm trong đơn hàng */}
              {order.items.length === 0 ? (
                <p className="text-gray-500 text-sm">No items in this order.</p>
              ) : (
                order.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex flex-col md:flex-row md:items-center gap-4 py-2 border-t"
                  >
                    <div className="flex items-start gap-6 text-sm w-full">
                      <img
                        crossOrigin='anonymous'
                        className="w-16 sm:w-20"
                        src={item.image && item.image[0] ? item.image[0] : 'https://via.placeholder.com/80'}
                        alt={item.name}
                      />
                      <div className="flex-1">
                        <p className="sm:text-base font-medium">{item.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                          <p>{currency}{item.price}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Size: {item.size}</p>
                        </div>
                        <p className="mt-1">
                          Payment Method:{' '}
                          <span className="text-gray-400">{order.payment_method || 'N/A'}</span>
                        </p>
                        <p className="mt-1">
                          Payment Status:{' '}
                          <span className="text-gray-400">{order.payment_status}</span>
                        </p>ỏ
                      </div>
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => openReviewModal(order, item)}
                          className="bg-blue-500 text-white px-4 py-2 text-sm rounded-sm"
                        >
                          Đánh giá
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal để thêm review */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-medium mb-4">Đánh giá sản phẩm: {selectedItem?.name}</h2>
            <form onSubmit={submitReview} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn số sao:</label>
                <Rating
                  initialRating={reviewData.rate}
                  onChange={handleReviewChange}
                  emptySymbol={<img src={assets.star_dull_icon} className="w-6 h-6" alt="empty star" />}
                  fullSymbol={<img src={assets.star_icon} className="w-6 h-6" alt="full star" />}
                  fractions={1} // Cho phép chọn sao nguyên
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-md"
                >
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;