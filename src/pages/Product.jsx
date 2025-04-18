// Product.js
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { currency, addToCart, fetchProductById } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState(''); // State để lưu kích cỡ được chọn
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Base URL cho hình ảnh
  const baseImageUrl = 'http://localhost:3000';

  const fetchProductData = async () => {
    setLoading(true);
    setError(null);
    try {
      const product = await fetchProductById(productId);
      setProductData(product);
      // Sử dụng small_image làm hình ảnh chính mặc định
      setImage(product.small_image ? `${baseImageUrl}${product.small_image}` : '');
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message);
      setProductData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, fetchProductById]);

  // Hàm để lấy giá dựa trên kích cỡ được chọn
  const getPriceBySize = () => {
    if (!productData || !productData.inventory) return 0;
    if (!size) {
      // Nếu chưa chọn kích cỡ, trả về giá của kích cỡ đầu tiên
      return productData.inventory[0]?.price || 0;
    }
    const selectedItem = productData.inventory.find((item) => item.size === size);
    return selectedItem?.price || 0;
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/*----------- Product Data-------------- */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/*---------- Product Images------------- */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {/* Hiển thị small_image ở đầu danh sách thumbnail */}
            {productData.small_image && (
              <img
                crossOrigin='anonymous'
                onClick={() => setImage(`${baseImageUrl}${productData.small_image}`)}
                src={`${baseImageUrl}${productData.small_image}`}
                className="w-[142px] h-[120px] sm:mb-3 flex-shrink-0 cursor-pointer object-cover"
                alt=""
              />
            )}
            {/* Hiển thị các hình ảnh từ productData.image sau small_image */}
            {productData.image.map((item, index) => (
              <img
                crossOrigin='anonymous'
                onClick={() => setImage(`${baseImageUrl}${item}`)}
                src={`${baseImageUrl}${item}`}
                key={index}
                className="w-[142px] h-[120px] sm:mb-3 flex-shrink-0 cursor-pointer object-cover"
                alt=""
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            {image ? (
              <img crossOrigin='anonymous' className="w-full h-auto" src={image} alt="" />
            ) : (
              <p className="text-center text-gray-500">No image available</p>
            )}
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_dull_icon} alt="" className="w-3 5" />
            <p className="pl-2">({productData.reviews_count})</p>
          </div>
          {/* Hiển thị giá động dựa trên kích cỡ được chọn */}
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {getPriceBySize()}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => addToCart(productData.id, size)}
            className={`bg-black text-white px-8 py-3 text-sm active:bg-gray-700 ${productData.out_of_stock || !size ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={productData.out_of_stock || !size}
          >
            ADD TO CART
          </button>
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm">Description</b>
          <p className="border px-5 py-3 text-sm">Reviews ({productData.reviews_count})</p>
        </div>
        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          <p>{productData.description}</p>
          <p>
            E-commerce websites typically display products or services along with detailed descriptions,
            images, prices, and any available variations (e.g., sizes, colors). Each product usually has
            its own dedicated page with relevant information.
          </p>
        </div>
      </div>

      {/* --------- Display Related Products ---------- */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} productId={productData.id} />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;