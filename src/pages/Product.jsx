import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import axios from 'axios';
import { toast } from 'react-toastify';

const Product = () => {
  const { productId } = useParams();
  const { currency, addToCart, fetchProductById, backendUrl } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const baseImageUrl = backendUrl;

  const fetchProductData = async () => {
    setLoading(true);
    setError(null);
    try {
      const product = await fetchProductById(productId);
      setProductData(product);
      setImage(product.small_image ? `${baseImageUrl}${product.small_image}` : '');
      setReviews([]);
      // Fetch reviews immediately after getting product data
      await fetchReviews(product.id);
    } catch (err) {
      setError('Unable to fetch product information: ' + err.message);
      setProductData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId) => {
    setLoadingReviews(true);
    try {
      const url = `${backendUrl}/api/reviews/list`;
      const params = {
        product_id: productId,
        page: 1,
        limit: 10,
        sort_by: 'creation_at',
        sort_order: 'DESC',
      };    
      const queryString = new URLSearchParams(params).toString();
      
      const response = await axios.get(url, { params });

      if (response.data.success) {
        setReviews(response.data.reviews);
      } else {
        console.error('Unable to fetch reviews:', response.data.message);
        toast.error('Unable to fetch reviews: ' + response.data.message);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Error fetching reviews: ' + error.message);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, fetchProductById]);

  const getPriceBySize = () => {
    if (!productData || !productData.inventory) return 0;
    if (!size) {
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
            {productData.small_image && (
              <img
                crossOrigin="anonymous"
                onClick={() => setImage(`${baseImageUrl}${productData.small_image}`)}
                src={`${baseImageUrl}${productData.small_image}`}
                className="w-[142px] h-[120px] sm:mb-3 flex-shrink-0 cursor-pointer object-cover"
                alt=""
              />
            )}
            {productData.image.map((item, index) => (
              <img
                crossOrigin="anonymous"
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
              <img crossOrigin="anonymous" className="w-full h-auto" src={image} alt="" />
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
            <p className="pl-2">({reviews.length})</p>
          </div>
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
            className={`bg-black text-white px-8 py-3 text-sm active:bg-gray-700 ${
              productData.out_of_stock || !size ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={productData.out_of_stock || !size}
          >
            ADD TO CART
          </button>
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available for this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className="mt-20">
        <div className="flex">
          <button
            onClick={() => setActiveTab('description')}
            className={`border px-5 py-3 text-sm ${
              activeTab === 'description' ? 'font-bold bg-gray-100' : ''
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`border px-5 py-3 text-sm ${
              activeTab === 'reviews' ? 'font-bold bg-gray-100' : ''
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>
        <div className="border px-6 py-6 text-sm text-gray-500">
          {activeTab === 'description' ? (
            <div className="flex flex-col gap-4">
              <p>{productData.description}</p>
              <p>
                E-commerce websites typically display products or services along with detailed
                descriptions, images, prices, and available variants (e.g., sizes, colors). Each
                product usually has its own dedicated page with relevant information.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {loadingReviews ? (
                <p>Loading reviews...</p>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.review_id} className="border-b pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        User #{review.user_id}
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, index) => (
                          <img
                            key={index}
                            src={
                              index < review.rate
                                ? assets.star_icon
                                : assets.star_dull_icon
                            }
                            alt=""
                            className="w-3 h-3"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(review.creation_at).toLocaleString('en-US')}
                    </p>
                  </div>
                ))
              ) : (
                <p>No reviews available for this product.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --------- Display Related Products ---------- */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
        productId={productData.id}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;