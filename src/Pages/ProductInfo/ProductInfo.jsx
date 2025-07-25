import React, { useState, useEffect } from "react";
import {
  Clock,
  Shield,
  MapPin,
  Eye,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { getProducts } from "../../features/slices/productSlice";
import Image from "../../Component/Atoms/Image/Image";

const ProductInfo = () => {
  dayjs.extend(relativeTime);
  const dispatch = useDispatch();
  const selector = useSelector((state) => state);
  const params = useParams();

  const [timeLeft, setTimeLeft] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    dispatch(getProducts({ productId: params?.id }))
      .then((result) => {
        if (!getProducts.fulfilled.match(result)) {
          const { message, code } = result.payload || {};
        }
      })
      .catch((error) => {
        console.error("Unexpected error:", error);
      });
  }, [dispatch]);

  let { product, loading, error } = selector ? selector : {};
  const productData = selector?.product?.productInfo;

  // Check if it's an auction or fixed price product
  const isAuction = productData?.saleType === "auction";

  useEffect(() => {
    if (!isAuction || !productData?.auctionDetails?.biddingEndsAt) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(
        productData.auctionDetails.biddingEndsAt
      ).getTime();
      const distance = endTime - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("Auction Ended");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [productData?.auctionDetails?.biddingEndsAt, isAuction]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Product Details - Admin View</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isAuction
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
              }`}>
              {isAuction ? 'Auction Product' : 'Fixed Price Product'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="relative mb-4">
              <img
                src={productData?.productImages?.[selectedImage]}
                alt="Product"
                  className="w-full h-64 object-cover rounded-lg"
              />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                {selectedImage + 1} / {productData?.productImages?.length}
              </div>
            </div>

              <div className="grid grid-cols-4 gap-2">
              {productData?.productImages?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Product ${index + 1}`}
                    className={`w-full h-16 object-cover rounded cursor-pointer border-2 ${selectedImage === index
                      ? "border-blue-500"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>
          </div>

          {/* Middle Column - Product Info */}


          {/* Right Column - Seller Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h3 className="text-lg font-semibold mb-3">Seller Information</h3>
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src={productData?.seller?.profileImage}
                  alt={productData?.seller?.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">{productData?.seller?.userName}</h4>
                    {productData?.seller?.is_Preferred_seller && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Shield className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">{productData?.seller?.followers} followers</p>
                </div>
              </div>

              <div className="space-y-2">
                {/* <div className="flex justify-between py-1">
                  <span className="text-gray-600 text-sm">Email</span>
                  <span className="font-medium text-sm">{productData?.seller?.email}</span>
                </div> */}
                {/* {JSON.stringify(productData?.seller)}
                <div className="flex justify-between py-1">
                  <span className="text-gray-600 text-sm">Phone</span>
                  <span className="font-medium text-sm">{productData?.seller?.phone || 'N/A'}</span>
                </div> */}
                <div className="flex justify-between py-1">
                  <span className="text-gray-600 text-sm">Join Date</span>
                  <span className="font-medium text-sm">
                    {dayjs(productData?.seller?.createdAt).format('MMM DD, YYYY')}
                  </span>
              </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600 text-sm">Verification</span>
                  <span className={`text-sm font-medium ${productData?.seller?.is_Verified_Seller ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {productData?.seller?.is_Verified_Seller ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Auction Bidders (if applicable) */}
            {isAuction && productData?.auctionDetails?.bidders?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-3">Recent Bidders</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {productData.auctionDetails.bidders.slice(0, 5).map((bidder, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-2">
                        <Image
                          src={bidder?.profileImage}
                          alt={bidder?.userName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        {/* {JSON.stringify(bidder)} */}
                        <span className="text-sm font-medium">{bidder?.userName}</span>
                  </div>
                  <div className="text-right">
                        <div className="text-sm font-bold text-green-600">฿{bidder.bidAmount}</div>
                        <div className="text-xs text-gray-500">
                          {dayjs(bidder.createdAt).format('MMM DD, HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
              <h3 className="text-lg font-semibold mb-3">Product Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600 text-sm">Created Date</span>
                  <span className="font-medium text-sm">
                    {dayjs(productData?.createdAt).format('MMM DD, YYYY')}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600 text-sm">Last Updated</span>
                  <span className="font-medium text-sm">
                    {dayjs(productData?.updatedAt).format('MMM DD, YYYY')}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600 text-sm">Total Comments</span>
                  <span className="font-medium text-sm">{productData?.commentData?.totalComments || 0}</span>
                  </div>
                {/* <div className="flex justify-between py-1">
                  <span className="text-gray-600 text-sm">Product Status</span>
                  <span className={`text-sm font-medium ${productData?.status === 'active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {productData?.status || 'Unknown'}
                  </span>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        <div className="">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {productData?.title}
            </h2>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              {productData?.description}
            </p>

            {productData?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {productData?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Price Information */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current Price</span>
                <span className="text-xl font-bold text-gray-900">
                  ฿{isAuction ? productData?.auctionDetails?.bidders?.[0]?.latestBidAmount || productData?.auctionDetails?.startingPrice : productData?.fixedPrice}
                </span>
              </div>

              {!isAuction && productData?.originPriceView && productData?.originPrice && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Original Price</span>
                  <span className="text-sm line-through text-gray-400">
                    ${productData?.originPrice}
                  </span>
                    </div>
              )}

              {!isAuction && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Shipping</span>
                  <span className="text-sm text-gray-700">
                    {productData?.deliveryType === 'free_shipping' ? 'Free' : `$${productData?.shippingCharge || 0}`}
                  </span>
                </div>
              )}
            </div>

            {/* Auction Timer */}
            {isAuction && timeLeft && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-xs font-medium">Auction Status</p>
                    <p className="text-sm font-semibold text-red-700">
                      Starting Price: ${productData?.auctionDetails?.startingPrice}
                    </p>
          </div>
                  <div className="text-right">
                    <div className="flex items-center text-red-600 mb-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="text-xs">Time Left</span>
                    </div>
                    <p className="text-sm font-semibold text-red-700">{timeLeft}</p>
                  </div>
                </div>
              </div>
            )}
        </div>

          {/* Product Specifications */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-3">Product Specifications</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-gray-600 text-sm">Condition</span>
                <span className="font-medium text-sm capitalize">
                  {productData?.condition?.replace("_", " ")}
                      </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600 text-sm">Category</span>
                <span className="font-medium text-sm">{productData?.categoryId?.name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600 text-sm">Total Views</span>
                <span className="font-medium text-sm flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {productData?.viewCount || 0}
                      </span>
                    </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600 text-sm">Total Likes</span>
                <span className="font-medium text-sm">{productData?.totalLike || 0}</span>
                      </div>
              {productData?.specifics?.map((spec, index) => (
                <div key={index} className="flex justify-between py-1">
                  <span className="text-gray-600 text-sm">{spec.parameterName}</span>
                  <span className="font-medium text-sm">{spec.valueName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;