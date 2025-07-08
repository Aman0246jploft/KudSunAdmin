import React, { useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from 'react-icons/bs';
import { IoMdImages } from 'react-icons/io';
import { FaBox } from 'react-icons/fa';
import { useSelector } from 'react-redux';

export default function MessageInput({ socket, room }) {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const fileInputRef = useRef(null);
  
  // Get user's products from Redux store
  const userProducts = useSelector(state => state.product.userProducts) || [];

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
    socket.emit('sendMessage', {
      roomId: room._id,
      type: 'PRODUCT',
      content: `Product: ${product.name}`,
      systemMeta: {
        productId: product._id,
        productName: product.name,
        productImage: product.image,
        price: product.price
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
    <div className="p-4 border-t">
      {/* Message input area */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <input
            className="w-full border rounded-md p-2 pr-24"
            value={text}
            onChange={handleTyping}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
          />
          
          {/* Action buttons */}
          <div className="absolute right-2 bottom-2 flex gap-2">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-500 hover:text-gray-700"
            >
              <BsEmojiSmile size={20} />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-gray-700"
            >
              <IoMdImages size={20} />
            </button>
            <button 
              onClick={() => setShowProductPicker(!showProductPicker)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaBox size={20} />
            </button>
          </div>
        </div>
        <button 
          onClick={handleSend} 
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Send
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

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Product picker */}
      {showProductPicker && (
        <div className="absolute bottom-20 right-4 bg-white rounded-lg shadow-lg p-4 w-72 max-h-80 overflow-y-auto">
          <h3 className="font-medium mb-2">Your Products</h3>
          {userProducts.length === 0 ? (
            <p className="text-gray-500">No products found</p>
          ) : (
            <div className="space-y-2">
              {userProducts.map(product => (
                <div 
                  key={product._id}
                  onClick={() => handleProductShare(product)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
