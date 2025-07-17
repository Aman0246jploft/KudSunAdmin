import React, { useEffect, useRef, useState, useCallback } from "react";
import MessageInput from "./MessageInput";
import { TiTick } from "react-icons/ti";
import Image from "../../Component/Atoms/Image/Image";
import { socketURL } from "../../api/baseUrl";

export default function ChatWindow({ room, socket }) {
  const [messages, setMessages] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const messagesEndRef = useRef();
  const messageContainerRef = useRef();
  const scrollPositionRef = useRef(0);

  let myUserId = JSON.parse(localStorage.getItem("kadSunInfo"))?.userId;

  // Utility function to ensure media URLs have the base URL
  const getFullMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${socketURL}${url}`;
  };

  // Smooth scroll to bottom function
  const scrollToBottom = useCallback((smooth = true) => {
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      const scrollOptions = {
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      };
      container.scrollTo(scrollOptions);
    }
  }, []);

  // Check if user is near bottom of chat
  const isNearBottom = useCallback(() => {
    if (!messageContainerRef.current) return false;
    const container = messageContainerRef.current;
    const threshold = 100;
    return container.scrollHeight - container.clientHeight <= container.scrollTop + threshold;
  }, []);

  // Scroll handler to trigger loading older messages on scroll near top
  const handleScroll = useCallback(() => {
    if (!messageContainerRef.current || loadingMore || !hasMore) return;

    const container = messageContainerRef.current;
    
    // Load more messages when scrolled to top
    if (container.scrollTop < 100) {
      setLoadingMore(true);
      scrollPositionRef.current = container.scrollHeight - container.scrollTop;
      
      socket.emit("getMessagesWithUser", {
        otherUserId: room.participants[0]?._id,
        pageNo: page + 1,
        size: 20,
      });
      setPage((prev) => prev + 1);
    }

    // Update scroll to bottom state based on scroll position
    setShouldScrollToBottom(isNearBottom());
  }, [loadingMore, hasMore, page, room, socket, isNearBottom]);

  // Restore scroll position after loading older messages
  const restoreScrollPosition = useCallback(() => {
    if (messageContainerRef.current && scrollPositionRef.current > 0) {
      const container = messageContainerRef.current;
      const newScrollTop = container.scrollHeight - scrollPositionRef.current;
      container.scrollTop = newScrollTop;
      scrollPositionRef.current = 0;
    }
  }, []);

  useEffect(() => {
    if (!room) {
      setMessages([]);
      setCurrentRoomId(null);
      setPage(1);
      setHasMore(true);
      setShouldScrollToBottom(true);
      return;
    }

    // If switching rooms, reset pagination and messages
    if (room._id !== currentRoomId) {
      setCurrentRoomId(room._id);
      setMessages([]);
      setPage(1);
      setHasMore(true);
      setIsInitialLoad(true);
      setShouldScrollToBottom(true);

      socket.emit("getMessagesWithUser", {
        otherUserId: room.participants[0]?._id,
        pageNo: 1,
        size: 20,
      });
    }

    // Handle initial and paginated message list
    const handleMessageList = (data) => {
      if (data.chatRoomId === room._id || (data.isNewRoom && room._id)) {
        if (page === 1) {
          // Initial load, replace messages
          setMessages(data.messages || []);
          setIsInitialLoad(false);
          // Scroll to bottom immediately for initial load
          requestAnimationFrame(() => {
            scrollToBottom(false);
          });
        } else {
          // Pagination: prepend older messages
          setMessages((prev) => [...data.messages, ...prev]);
          // Restore scroll position after loading older messages
          requestAnimationFrame(() => {
            restoreScrollPosition();
          });
        }

        // If fewer messages than page size received, no more messages to load
        setHasMore(data.messages.length >= 20);
        setLoadingMore(false);

        // Mark messages as seen for this room
        if (data.chatRoomId) {
          socket.emit("markMessagesAsSeen", { roomId: data.chatRoomId });
        }
      }
    };

    // Handle new incoming message
    const handleNewMessage = (msg) => {
      if (msg.chatRoom === room._id) {
        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some(
            (m) =>
              m._id === msg._id ||
              (m.content === msg.content &&
                m.sender?._id === msg.sender?._id &&
                Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) <
                1000)
          );
          
          if (!exists) {
            // Mark as seen if message not sent by me
            if (msg.sender?._id !== myUserId && 
                msg.messageType !== 'SYSTEM' && 
                msg.messageType !== 'ORDER_STATUS' && 
                msg.messageType !== 'PAYMENT_STATUS') {
              socket.emit("markMessagesAsSeen", { roomId: msg.chatRoom });
            }
            
            return [...prev, msg];
          }
          return prev;
        });

        // Auto-scroll to bottom for new messages if user is near bottom
        requestAnimationFrame(() => {
          if (shouldScrollToBottom || msg.sender?._id === myUserId) {
            scrollToBottom(true);
          }
        });
      }
    };

    // Handle messagesSeen event
    const handleMessagesSeen = ({ roomId, userId }) => {
      if (roomId === currentRoomId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (msg.chatRoom === roomId && msg.sender?._id !== userId) {
              if (!msg.seenBy) msg.seenBy = [];
              if (!msg.seenBy.includes(userId)) {
                msg.seenBy.push(userId);
              }
            }
            return msg;
          })
        );
      }
    };

    socket.on("messageList", handleMessageList);
    socket.on("newMessage", handleNewMessage);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket.off("messageList", handleMessageList);
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [room, socket, currentRoomId, page, myUserId, shouldScrollToBottom, scrollToBottom, restoreScrollPosition]);

  if (!room) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 text-gray-500">
        <div className="text-center px-4">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm text-gray-400 mt-1">Choose from your existing conversations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative flex-shrink-0">
            <Image
              src={room.participants[0]?.profileImage}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
            {room.participants[0]?.isLive && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 truncate" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{room.participants[0]?.userName}</h3>
            <p className="text-xs text-gray-500">
              {room.participants[0]?.isLive ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages container */}
      <div
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-gray-50"
        style={{ scrollBehavior: 'smooth' }}
      >
        {loadingMore && (
          <div className="text-center py-2">
            <div className="inline-block px-4 py-2 bg-white rounded-lg shadow-sm">
              <div className="animate-pulse flex items-center">
                <div className="h-2 w-4 bg-gray-200 rounded"></div>
                <div className="h-2 w-4 mx-1 bg-gray-200 rounded"></div>
                <div className="h-2 w-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isSentByMe = msg.sender?._id === myUserId;
          const seenUsers = msg.seenBy?.filter((id) => id !== myUserId) || [];
          const isSeen = isSentByMe && seenUsers.length > 0;

          // Handle system messages
          if (msg.messageType === 'SYSTEM' || msg.messageType === 'ORDER_STATUS' || 
              msg.messageType === 'PAYMENT_STATUS' || msg.messageType === 'SHIPPING_STATUS') {
            return (
              <div key={msg._id || idx} className="flex justify-center px-2">
                <div className={`
                  rounded-lg p-3 shadow-sm max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] 
                  ${getStatusColor(msg.systemMeta?.theme)} border
                `}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      {msg.systemMeta?.icon ? (
                        <img src={msg.systemMeta.icon} alt="status" className="w-5 h-5" />
                      ) : getStatusIcon(msg.systemMeta?.theme)}
                    </div>
                    <div className="font-medium text-sm min-w-0">
                      {getSystemMessageTitle(msg.systemMeta?.statusType)}
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{msg.content}</p>
                </div>
              </div>
            );
          }

          // Handle product messages
          if (msg.messageType === 'PRODUCT') {
            return (
              <div
                key={msg._id || idx}
                className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} px-2`}
              >
                <div className={`
                  max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] 
                  flex flex-col 
                  ${isSentByMe ? 'items-end' : 'items-start'}
                `}>
                  <div className={`
                    rounded-lg p-3 shadow-sm
                    ${isSentByMe 
                      ? 'bg-blue-500 text-white rounded-br-sm' 
                      : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                    }
                  `}>
                    {/* Product Card */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-sm">
                      {/* Product Image */}
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={msg.systemMeta?.productImage || msg.systemMeta?.productId?.productImages?.[0]}
                          alt={msg.systemMeta?.productName || msg.systemMeta?.productId?.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.png';
                          }}
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-3">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                          {msg.systemMeta?.productName || msg.systemMeta?.productId?.title}
                        </h4>
                        
                        {/* Price */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-green-600">
                            ${msg.systemMeta?.price || msg.systemMeta?.productId?.fixedPrice || 'N/A'}
                          </span>
                          {msg.systemMeta?.productId?.saleType === 'auction' && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              Auction
                            </span>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewProduct(msg.systemMeta?.productId?._id || msg.systemMeta?.productId)}
                            className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            View Product
                          </button>
                                                      <button
                              onClick={() => handleAddToCart(msg.systemMeta)}
                              className="flex-1 bg-green-600 text-white text-xs py-2 px-3 rounded-md hover:bg-green-700 transition-colors"
                            >
                              {msg.systemMeta?.saleType === 'auction' ? 'View Auction' : 'Add to Cart'}
                            </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-1 space-x-1">
                    <span className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {isSentByMe && isSeen && (
                      <TiTick className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Regular messages
          return (
            <div
              key={msg._id || idx}
              className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} px-2`}
            >
              <div className={`
                max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] 
                flex flex-col 
                ${isSentByMe ? 'items-end' : 'items-start'}
              `}>
          
                <div className={`
                  rounded-lg p-3 shadow-sm
                  ${isSentByMe 
                    ? 'bg-blue-500 text-white rounded-br-sm' 
                    : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                  }
                `} style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                  {msg.messageType === 'IMAGE' && (
                    <div className="mb-2">
                      <img
                        src={getFullMediaUrl(msg?.mediaUrl)}
                        alt="message"
                        className="rounded-lg max-w-full h-auto max-h-80 w-auto cursor-pointer hover:opacity-90 transition-opacity"
                        loading="lazy"
                        style={{ maxWidth: '300px' }}
                        onClick={() => window.open(getFullMediaUrl(msg?.mediaUrl), '_blank')}
                      />
                    </div>
                  )}
                  {msg.messageType === 'VIDEO' && (
                    <div className="mb-2">
                      <video
                        src={getFullMediaUrl(msg.mediaUrl)}
                        controls
                        className="rounded-lg max-w-full h-auto max-h-80"
                        style={{ maxWidth: '300px' }}
                      />
                    </div>
                  )}
                  {msg.messageType === 'FILE' && (
                    <a
                      href={getFullMediaUrl(msg.mediaUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm underline hover:no-underline transition-all"
                    >
                      <span>📎</span>
                      <span style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{msg.fileName || 'Download file'}</span>
                    </a>
                  )}
                  {msg.content && (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                      {msg.mediaUrl ? "" : msg.content}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center mt-1 space-x-1">
                  <span className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {isSentByMe && isSeen && (
                    <TiTick className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <MessageInput socket={socket} room={room} />
    </div>
  );
}

// Utility functions
const getStatusColor = (theme) => {
  switch (theme) {
    case 'success': return 'bg-green-50 border-green-200';
    case 'warning': return 'bg-yellow-50 border-yellow-200';
    case 'error': return 'bg-red-50 border-red-200';
    case 'info': return 'bg-blue-50 border-blue-200';
    default: return 'bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (theme) => {
  switch (theme) {
    case 'success': return '✅';
    case 'warning': return '⚠️';
    case 'error': return '❌';
    case 'info': return 'ℹ️';
    default: return '📢';
  }
};

const getSystemMessageTitle = (statusType) => {
  switch (statusType) {
    case 'ORDER': return 'Order Update';
    case 'PAYMENT': return 'Payment Update';
    case 'SHIPPING': return 'Shipping Update';
    case 'SYSTEM': return 'System Message';
    default: return 'Notification';
  }
};

// Product message action handlers
const handleViewProduct = (productId) => {
  if (!productId) {
    console.error('No product ID provided');
    return;
  }
  
  // Navigate to product page
  window.open(`/product/${productId}`, '_blank');
};

const handleAddToCart = async (productData) => {
  try {
    // Check if product is available
    if (productData.isSold && productData.saleType === 'fixed') {
      alert('This product is already sold');
      return;
    }

    if (!productData.isActive) {
      alert('This product is not currently available');
      return;
    }

    // For auction products, redirect to product page instead
    if (productData.saleType === 'auction') {
      handleViewProduct(productData.productId);
      return;
    }

    // Add to cart logic here
    // You can integrate with your cart system
    console.log('Adding to cart:', productData);
    
    // Example cart integration:
    // const cartItem = {
    //   productId: productData.productId,
    //   quantity: 1,
    //   price: productData.price
    // };
    // dispatch(addToCart(cartItem));
    
    alert('Product added to cart!');
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('Failed to add product to cart');
  }
};
