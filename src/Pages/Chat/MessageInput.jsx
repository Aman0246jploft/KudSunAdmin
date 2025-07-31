import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from 'react-icons/bs';
import { IoMdImages } from 'react-icons/io';
import { FaBox } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import { useSelector } from 'react-redux';

export default function MessageInput({ socket, room }) {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const fileInputRef = useRef(null);
  const emojiButtonRef = useRef(null);

  // Get user's products from Redux store
  const userProducts = useSelector(state => state.product.userProducts) || [];

  // Filter products based on search term and availability
  const filteredProducts = userProducts.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(productSearchTerm.toLowerCase());
    const isAvailable = !product.isSold || product.saleType === 'auction';
    const isActive = product.isActive !== false;
    return matchesSearch && isAvailable && isActive;
  });

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container') && !event.target.closest('.emoji-button')) {
        setShowEmojiPicker(false);
      }
      if (showProductPicker && !event.target.closest('.product-picker-container') && !event.target.closest('.product-button')) {
        setShowProductPicker(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showEmojiPicker, showProductPicker]);

  const handleSend = () => {
    if (!text.trim()) return;








    // Determine message type based on content
    let messageType = 'TEXT';
    let content = text.trim();
    let systemMeta = null;

    // Check if it's a URL
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    const isUrl = urlPattern.test(content);

    // Check if it's an image URL
    const imagePattern = /\.(jpg|jpeg|png|gif|webp)$/i;
    const isImage = isUrl && imagePattern.test(content);

    // Check if it's a video URL
    const videoPattern = /\.(mp4|webm|ogg)$/i;
    const isVideo = isUrl && videoPattern.test(content);

    // Check if it's an audio URL
    const audioPattern = /\.(mp3|wav|ogg)$/i;
    const isAudio = isUrl && audioPattern.test(content);

    // Set message type based on content
    if (isImage) {
      messageType = 'IMAGE';
    } else if (isVideo) {
      messageType = 'VIDEO';
    } else if (isAudio) {
      messageType = 'AUDIO';
    } else if (isUrl) {
      messageType = 'FILE';
    }



    // Send the message with appropriate type
    socket.emit('sendMessage', {
      roomId: room._id,
      type: messageType,
      content: content,
      systemMeta: systemMeta
    });

    setText('');
    setIsTyping(false);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileType = file.type.split('/')[0];
      let messageType = 'FILE';

      if (fileType === 'image') messageType = 'IMAGE';
      else if (fileType === 'video') messageType = 'VIDEO';
      else if (fileType === 'audio') messageType = 'AUDIO';




      socket.emit('sendMessage', {
        roomId: room._id,
        type: messageType,
        content: event.target.result,
        fileName: file.name,
        systemMeta: null
      });
    };






    reader.readAsDataURL(file);
    e.target.value = null; // Reset file input
  };

  const handleEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
  };

  const handleProductShare = (product) => {
    // Validate product before sharing
    if (!product._id) {
      alert('Invalid product data');
      return;
    }

    // Check if product is available
    if (product.isSold && product.saleType === 'fixed') {
      alert('This product is already sold and cannot be shared');
      return;
    }

    if (!product.isActive) {
      alert('This product is not currently active');
      return;
    }

    socket.emit('sendMessage', {
      roomId: room._id,
      type: 'PRODUCT',
      content: `Product: ${product.title}`,
      systemMeta: {
        productId: product._id,
        productName: product.title,
        productImage: product.productImages?.[0] || product.image,
        price: product.fixedPrice || product.auctionSettings?.startingBid || 0,
        saleType: product.saleType,
        condition: product.condition,
        category: product.categoryId?.name,
        subCategory: product.subCategoryId?.name,
        description: product.description,
        isSold: product.isSold,
        isActive: product.isActive,
        // Auction specific data
        ...(product.saleType === 'auction' && {
          currentBid: product.auctionSettings?.currentBid,
          startingBid: product.auctionSettings?.startingBid,
          endTime: product.auctionSettings?.endTime,
          bidCount: product.auctionSettings?.bidCount || 0
        })
      }
    });
    setShowProductPicker(false);
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    const value = e.target.value;
    setText(value);

    if (value && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { roomId: room._id });
    } else if (!value && isTyping) {
      setIsTyping(false);
      socket.emit('stopTyping', { roomId: room._id });
    }
  };

  return (
    <div className="relative">
      {/* Emoji picker with popup positioning */}
      {showEmojiPicker && (
        <div className="emoji-picker-container absolute bottom-full right-0 mb-2 z-50">
          <div className="relative">
            <div className="bg-white shadow-2xl rounded-lg border border-gray-200 overflow-hidden">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={350}
                height={400}
                skinTonesDisabled={false}
                searchDisabled={false}
                previewConfig={{
                  showPreview: true
                }}
                lazyLoadEmojis={true}
              />
            </div>
            {/* Close button overlay */}

          </div>
        </div>
      )}

      {/* Product picker with improved positioning */}
      {showProductPicker && (
        <div className="product-picker-container absolute bottom-full left-0 right-0 mb-2 z-50 px-2">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-full max-w-sm mx-auto max-h-80 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">Share Product</h3>
              <button
                onClick={() => setShowProductPicker(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search your products..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none   focus:border-transparent"
              />
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaBox size={32} className="mx-auto mb-2 opacity-50" />
                <p>{productSearchTerm ? 'No products found' : 'No products available'}</p>
                {productSearchTerm && (
                  <button
                    onClick={() => setProductSearchTerm('')}
                    className="text-blue-500 text-sm mt-2 hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map(product => (
                  <div
                    key={product._id}
                    onClick={() => handleProductShare(product)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                  >
                    <img
                      src={product.productImages?.[0] || product.image}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.png';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 truncate text-sm">{product.title}</p>
                        {product.saleType === 'auction' && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full">
                            Auction
                          </span>
                        )}
                        {product.isSold && product.saleType === 'fixed' && (
                          <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                            Sold
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        ${product.fixedPrice || product.auctionSettings?.startingBid || 'N/A'}
                        {product.saleType === 'auction' && product.auctionSettings?.currentBid && (
                          <span className="ml-1 text-green-600">
                            (Current: ${product.auctionSettings.currentBid})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {product.condition} • {product.categoryId?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message input area */}
      <div className="p-3 border-t bg-white">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <input
                className="flex-1 bg-transparent px-4 py-3 pr-24 sm:pr-28 focus:outline-none resize-none text-sm placeholder-gray-500"
                value={text}
                onChange={handleTyping}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
              />

              {/* Action buttons */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  ref={emojiButtonRef}
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowProductPicker(false);
                  }}
                  className="emoji-button text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100"
                  title="Add emoji"
                >
                  <BsEmojiSmile size={16} />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100"
                  title="Upload media"
                >
                  <IoMdImages size={16} />
                </button>
                <button
                  onClick={() => {
                    setShowProductPicker(!showProductPicker);
                    setShowEmojiPicker(false);
                  }}
                  className="product-button text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100"
                  title="Share product"
                >
                  <FaBox size={14} />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={`
              p-3 rounded-full flex items-center justify-center flex-shrink-0
              transition-all duration-200 ease-in-out
              ${text.trim()
                ? 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
            title="Send message"
          >
            <IoSend size={18} />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        />
      </div>
    </div>
  );
}
