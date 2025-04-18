import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {

  const { products, currency, cartItems, updateQuantity, navigate, backendUrl } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  useEffect(() => {
    if (cartItems && cartItems.items && cartItems.items.length > 0) {
      const tempData = cartItems.items.map((item) => ({
        _id: item.product.id,  // Lấy ID sản phẩm từ product.id
        size: item.size,
        quantity: item.quantity,
        cart_item_id: item.cart_item_id,
        product: item.product,
        price: item.price
        // Nếu cần để cập nhật/xóa
      }));
      setCartData(tempData);
    } else {
      setCartData([]);  // Đặt cartData rỗng nếu không có items
    }
  }, [cartItems, products]);
  console.log(cartData)
  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div>
        {cartData.map((item, index) => {
          // Tạo URL hình ảnh từ small_image
          const imageUrl = `${backendUrl}${item.product.small_image}`;

          return (
            <div
              key={index}
              className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'
            >
              <div className='flex items-start gap-6'>
                <img
                  crossOrigin='anonymous'
                  className='w-16 sm:w-20'
                  src={imageUrl}
                  alt={item.product.name}
                />
                <div>
                  <p className='text-xs sm:text-lg font-medium'>{item.product.name}</p>
                  <div className='flex items-center gap-5 mt-2'>
                    <p>{currency}{item.price}</p>
                    <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                  </div>
                </div>
              </div>
              <input
                onChange={(e) =>
                  e.target.value === '' || e.target.value === '0'
                    ? null
                    : updateQuantity(item.cart_item_id, Number(e.target.value))
                }
                className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1'
                type='number'
                min={1}
                defaultValue={item.quantity}
              />
              <img
                onClick={() => updateQuantity(item.cart_item_id, 0)}
                className='w-4 mr-4 sm:w-5 cursor-pointer'
                src={assets.bin_icon}
                alt='Remove'
              />
            </div>
          );
        })}
      </div>

      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal />
          <div className='w-full text-end'>
            <button
              onClick={() => navigate('/place-order')}
              className='bg-black text-white text-sm my-8 px-8 py-3'
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
