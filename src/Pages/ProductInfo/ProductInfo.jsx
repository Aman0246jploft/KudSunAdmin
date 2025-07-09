import React, { useState, useEffect } from "react";
import {
  Heart,
  Share2,
  MessageCircle,
  Clock,
  Users,
  Gavel,
  Shield,
  Truck,
  ChevronRight,
  Star,
  MapPin,
  Eye,
  ShoppingCart,
  UserPlus,
  UserCheck,
  Upload,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { getProducts } from "../../features/slices/productSlice";
import Image from "../../Component/Atoms/Image/Image";
import { addComment } from "../../features/slices/commentSlice";
import { toast } from "react-toastify";
import Modal from "./Modal";
import CommentModal from "./CommentModal";
import authAxiosClient from "../../api/authAxiosClient";

const ProductInfo = () => {
  dayjs.extend(relativeTime);
  const dispatch = useDispatch();
  const selector = useSelector((state) => state);
  const params = useParams();
  console.log(params);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [newBid, setNewBid] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [replyImages, setReplyImages] = useState([]);

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

  console.log("0000011111", productData);

  // Check if it's an auction or fixed price product
  const isAuction = productData?.saleType === "auction";
  const isFixedPrice = productData?.saleType === "fixed";

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

  useEffect(() => {
    if (productData) {
      setIsFollowing(productData?.seller?.isFollowing || false);
      setIsLiked(productData?.isLike || false);
    }
  }, [productData]);

  const handleBidSubmit = () => {
    if (newBid && parseFloat(newBid) > productData?.auctionDetails?.bidders[0]?.latestBidAmount) {
      console.log("New bid:", newBid);
      setNewBid("");
    }
  };

  const handleAddToCart = () => {
    console.log("Add to cart:", { productId: params?.id, quantity });
    // Add your cart logic here
  };

  const handleBuyNow = () => {
    console.log("Buy now:", { productId: params?.id, quantity });
    // Add your buy now logic here
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // Add your follow/unfollow logic here
  };

  const handleLike = async () => {
    try {
      await authAxiosClient.post('/user/productLike', { productId: params?.id });
      // Refresh product data to get updated like status
      dispatch(getProducts({ productId: params?.id }));
    } catch (error) {
      console.error('Error liking product:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleShare = () => {
    // Add your share logic here
    console.log("Share product");
  };

  const handleMessage = () => {
    // Add your message logic here
    console.log("Message seller");
  };

  const handleCommentSubmit = (parentId = null) => {
    const commentContent = parentId ? replyText : newComment;
    const imagesToUpload = parentId ? replyImages : selectedImages;
    
    if (commentContent.trim()) {
      console.log("New comment:", commentContent, "Parent ID:", parentId);

      const formData = new FormData();
      formData.append("content", commentContent);
      formData.append("product", params?.id || "");
      formData.append("parent", parentId || ""); // Use parentId for replies

      // Add images to FormData
      if (imagesToUpload.length > 0) {
        imagesToUpload.forEach((image) => {
          formData.append("files", image);
        });
      }

      dispatch(addComment(formData))
        .then((result) => {
          if (addComment.fulfilled.match(result)) {
            toast.success(parentId ? "Reply Added" : "Comment Added");
            dispatch(getProducts({ productId: params?.id }))
              .then((result) => {
                if (!getProducts.fulfilled.match(result)) {
                  const { message, code } = result.payload || {};
                }
              })
              .catch((error) => {
                console.error("Unexpected error:", error);
              });
          } else {
            const { message, code } = result.payload || {};
            console.error(`Comment failed [${code}]: ${message}`);
          }
        })
        .catch((error) => {
          console.error("Unexpected error:", error);
          toast.error("Unexpected error occurred");
        });

      if (parentId) {
        setReplyText("");
        setReplyingTo(null);
        setReplyImages([]);
      } else {
        setNewComment("");
        setSelectedImages([]);
      }
    }
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyText("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
    setReplyImages([]);
  };

  const handleImageUpload = (e, isReply = false) => {
    const files = Array.from(e.target.files);
    if (isReply) {
      setReplyImages(files);
    } else {
      setSelectedImages(files);
    }
  };

  const removeImage = (index, isReply = false) => {
    if (isReply) {
      setReplyImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Top Profile Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src={productData?.seller?.profileImage}
                alt={productData?.seller?.userName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-lg">{productData?.seller?.userName}</h3>
                  {productData?.seller?.is_Id_verified && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-500 text-sm">{productData?.seller?.followers} followers</p>
              </div>
            </div>
            <button
              onClick={handleFollow}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isFollowing
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4 inline mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 inline mr-1" />
                  Follow
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={productData?.productImages?.[selectedImage]}
                alt="Product"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />

              <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                {selectedImage + 1} / {productData?.productImages?.length}
              </div>
              {/* Sale Type Badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isAuction 
                    ? 'bg-red-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {isAuction ? 'Auction' : 'Fixed Price'}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 overflow-x-auto">
              {productData?.productImages?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Product ${index + 1}`}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                    selectedImage === index
                      ? "border-blue-500"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Price and Views */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-gray-900">
                      ${isAuction ? productData?.auctionDetails?.bidders?.[0]?.latestBidAmount : productData?.fixedPrice}
                    </span>
                    {!isAuction && productData?.originPriceView && productData?.originPrice && (
                      <span className="text-lg line-through text-gray-400">
                        ${productData?.originPrice}
                      </span>
                    )}
                  </div>
                  {!isAuction && (
                    <p className="text-sm text-gray-500 mt-1">
                      {productData?.deliveryType === 'free_shipping' ? 'Free shipping' : `+$${productData?.shippingCharge || 0} shipping`}
                    </p>
                  )}
                </div>
           
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isLiked
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {productData?.totalLike || 0}
                  Like 
                </button>
                {/* <button
                  onClick={handleShare}
                  className="flex items-center px-4 py-2 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button> */}
                {/* <button
                  onClick={handleMessage}
                  className="flex items-center px-4 py-2 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </button> */}
              </div>
            </div>

            {/* Title and Description */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {productData?.title}
              </h1>
              <p className="text-gray-600 mb-4">{productData?.description}</p>

              <div className="flex items-center space-x-2 mb-4">
                {productData?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Auction Timer or Buy Options */}
            {isAuction ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Current Bid</p>
                    <p className="text-2xl font-bold text-red-700">
                      ${productData?.auctionDetails?.bidders?.[0]?.latestBidAmount || productData?.auctionDetails?.startingPrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-red-600 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">Ends in</span>
                    </div>
                    <p className="text-lg font-semibold text-red-700">{timeLeft}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={newBid}
                    onChange={(e) => setNewBid(e.target.value)}
                    placeholder="Enter bid amount"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={handleBidSubmit}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Gavel className="w-4 h-4 mr-2" />
                    Place Bid
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* <button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Buy Now
                </button> */}
              </div>
            )}

            {/* Product Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition</span>
                  <span className="font-medium capitalize">
                    {productData?.condition?.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{productData?.categoryId?.name}</span>
                </div>
                {productData?.specifics?.map((spec, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{spec.parameterName}</span>
                    <span className="font-medium">{spec.valueName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Comments ({productData?.commentData?.totalComments || 0})
          </h3>

          <div className="mb-4">
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleCommentSubmit()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Post
                </button>
              </div>

              {/* Image Upload Section */}
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-1 cursor-pointer text-gray-600 hover:text-blue-600">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Add Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="hidden"
                  />
                </label>
                {selectedImages.length > 0 && (
                  <span className="text-sm text-blue-600">
                    {selectedImages.length} image(s) selected
                  </span>
                )}
              </div>

              {/* Image Preview */}
              {selectedImages.length > 0 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index, false)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto">
            {productData?.commentData?.topComments?.map((comment, index) => (
              <div key={index} className="border-b border-gray-100 pb-3">
                <div className="flex items-start space-x-3">
                  <Image
                    src={comment.author.profileImage}
                    alt={comment.author.userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.author.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {dayjs(comment.createdAt).fromNow()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                    
                    {/* Comment Images */}
                    {comment.photos && comment.photos.length > 0 && (
                      <div className="mb-2 flex space-x-2 overflow-x-auto">
                        {comment.photos.map((photo, photoIndex) => (
                          <img
                            key={photoIndex}
                            src={photo}
                            alt={`Comment image ${photoIndex + 1}`}
                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                            onClick={() => window.open(photo, "_blank")}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Reply Button */}
                    <button
                      onClick={() => handleReply(comment._id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Reply
                    </button>

                    {/* Reply Input Field */}
                    {replyingTo === comment._id && (
                      <div className="mt-3 ml-4">
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Reply to ${comment.author.userName}...`}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleCommentSubmit(comment._id)}
                              className="bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Reply
                            </button>
                            <button
                              onClick={cancelReply}
                              className="bg-gray-500 text-white px-3 py-2 text-sm rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>

                          {/* Reply Image Upload */}
                          <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-1 cursor-pointer text-gray-600 hover:text-blue-600">
                              <Upload className="w-3 h-3" />
                              <span className="text-xs">Add Images</span>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, true)}
                                className="hidden"
                              />
                            </label>
                            {replyImages.length > 0 && (
                              <span className="text-xs text-blue-600">
                                {replyImages.length} image(s) selected
                              </span>
                            )}
                          </div>

                          {/* Reply Image Preview */}
                          {replyImages.length > 0 && (
                            <div className="flex space-x-2 overflow-x-auto">
                              {replyImages.map((image, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Reply Preview ${index + 1}`}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                  <button
                                    onClick={() => removeImage(index, true)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                                  >
                                    <X className="w-2 h-2" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Display Replies */}
                    {comment?.replies && comment?.replies?.length > 0 && (
                      <div className="mt-3 ml-4 space-y-3">
                        {comment?.replies?.map((reply, replyIndex) => (
                          <div key={replyIndex} className="flex items-start space-x-2 bg-gray-50 p-3 rounded-lg">
                            <Image
                              src={reply.author.profileImage}
                              alt={reply.author.userName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-xs">
                                  {reply.author.userName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {dayjs(reply.createdAt).fromNow()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-700">{reply.content}</p>
                              
                              {/* Reply Images */}
                              {reply.photos && reply.photos.length > 0 && (
                                <div className="mt-2 flex space-x-2 overflow-x-auto">
                                  {reply.photos.map((photo, photoIndex) => (
                                    <img
                                      key={photoIndex}
                                      src={photo}
                                      alt={`Reply image ${photoIndex + 1}`}
                                      className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                                      onClick={() => window.open(photo, "_blank")}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {productData?.commentData?.totalComments > productData?.commentData?.topComments?.length && (
              <div
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="bg-gray-50 rounded-lg p-3 cursor-pointer text-center hover:bg-gray-100 transition-colors"
              >
                <span className="text-blue-600 font-medium">Show more comments</span>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Products */}
        {productData?.recommendedProducts?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-6">Recommended</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productData.recommendedProducts.slice(0, 6).map((product, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <img
                    src={product.productImages[0]}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ${product.saleType === 'auction' 
                          ? product.auctionSettings?.startingPrice 
                          : product.fixedPrice}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.saleType === 'auction' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {product.saleType === 'auction' ? 'Auction' : 'Fixed'}
                      </span>
                    </div>
                    {product.userId && (
                      <div className="flex items-center mt-3">
                        <Image
                          src={product.userId.profileImage}
                          alt={product.userId.userName}
                          className="w-6 h-6 rounded-full object-cover mr-2"
                        />
                        <span className="text-sm text-gray-600">{product.userId.userName}</span>
                        {product.userId.isLive && (
                          <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CommentModal />
      </Modal>
    </div>
  );
};

export default ProductInfo;