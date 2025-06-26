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
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { getProducts } from "../../features/slices/productSlice";
import Image from "../../Component/Atoms/Image/Image";
import { addComment } from "../../features/slices/commentSlice";
import { toast } from "react-toastify";
import Modal from "./Modal";
import CommentModal from "./CommentModal";

const ProductInfo = () => {
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

  useEffect(() => {
    if (!productData?.auctionDetails?.biddingEndsAt) return;

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
  }, [productData?.auctionDetails?.biddingEndsAt]);

  const handleBidSubmit = () => {
    if (newBid && parseFloat(newBid) > productData?.currentPrice) {
      console.log("New bid:", newBid);
      setNewBid("");
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      console.log("New comment:", newComment);

      const formData = new FormData();
      formData.append("content", newComment);
      formData.append("product", params?.id || "");
      formData.append("parent", ""); // Use actual parent ID if replying

      dispatch(addComment(formData))
        .then((result) => {
          if (addComment.fulfilled.match(result)) {
            toast.success("Comment Added");
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

      setNewComment("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={productData?.productImages[selectedImage]}
                alt="Product"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                {selectedImage + 1} / {productData?.productImages.length}
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
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {productData?.title}
              </h1>
              <p className="text-gray-600 mb-4">{productData?.description}</p>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  {productData?.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Current Bid</p>
                    <p className="text-3xl font-bold">
                      ฿
                      {productData?.auctionDetails?.bidders[0]?.latestBidAmount}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-red-100 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">Ends in</span>
                    </div>
                    <p className="text-lg font-semibold">{timeLeft}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auction Info */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Starting Price</p>
                  <p className="font-semibold">
                    ฿{productData?.auctionDetails?.startingPrice}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Reserve Price</p>
                  <p className="font-semibold">
                    ฿{productData?.auctionDetails?.reservePrice}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total Bids</p>
                  <p className="font-semibold">
                    {productData?.auctionDetails?.totalBids}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Shipping</p>
                  <p className="font-semibold">
                    ฿{productData?.shippingCharge}
                  </p>
                </div>
              </div>

              {productData?.isReserveMet && (
                <div className="mt-3 flex items-center text-green-600">
                  <Shield className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Reserve met</span>
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image
                    src={productData?.seller.profileImage}
                    alt={productData?.seller.userName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">
                      {productData?.seller.userName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {productData?.seller?.followers} followers
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isFollowing
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">Specifications</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition</span>
                  <span className="font-medium capitalize">
                    {productData?.condition.replace("_", " ")}
                  </span>
                </div>
                {productData?.specifics.map((spec, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{spec.parameterName}</span>
                    <span className="font-medium">{spec.valueName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Bidders and Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Bidders */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Recent Bidders
            </h3>
            <div className="space-y-3">
              {productData?.auctionDetails?.bidders?.map((bidder, index) => {
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {bidder.userName[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{bidder.userName}</p>
                        {bidder.isLive && (
                          <div className="flex items-center text-green-600 text-xs">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            Live
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">฿{bidder.latestBidAmount}</p>
                      <p className="text-xs text-gray-500">Latest bid</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comments ({productData?.commentData?.totalComments})
            </h3>

            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCommentSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Post
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto">
              {productData?.commentData?.topComments?.map((comment, index) => (
                <div key={index} className="border-b border-gray-100 pb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">
                        {comment.author.userName[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.author.userName}
                        </span>
                        <span className="text-xs text-gray-500">2h ago</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                      {comment?.replies && comment?.replies?.length > 0 && (
                        <div className="mt-2 ml-4 space-y-2">
                          {comment?.replies?.map((reply, replyIndex) => (
                            <div
                              key={replyIndex}
                              className="flex items-start space-x-2"
                            >
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs">
                                  {reply.author.userName[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-xs">
                                  {reply.author.userName}
                                </span>
                                <p className="text-xs text-gray-600">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="bg-gray-100 rounded-lg p-0.5 cursor-pointer text-center active:scale-95  "
              >
                Show more
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CommentModal />
      </Modal>
    </div>
  );
};

export default ProductInfo;
