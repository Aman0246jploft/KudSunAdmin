import React, { useEffect, useRef, useState } from "react";
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

  const messagesEndRef = useRef();
  const messageContainerRef = useRef();
  console.log("messagesmessages", messages)

  let myUserId = JSON.parse(localStorage.getItem("kadSunInfo"))?.userId;

  // Utility function to ensure media URLs have the base URL
  const getFullMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${socketURL}${url}`;
  };

  // Scroll handler to trigger loading older messages on scroll near top
  const handleScroll = () => {
    if (!messageContainerRef.current || loadingMore || !hasMore) return;

    if (messageContainerRef.current.scrollTop < 100) {
      setLoadingMore(true);
      socket.emit("getMessagesWithUser", {
        otherUserId: room.participants[0]?._id,
        pageNo: page + 1,
        size: 20,
      });
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (!room) {
      setMessages([]);
      setCurrentRoomId(null);
      setPage(1);
      setHasMore(true);
      return;
    }

    // If switching rooms, reset pagination and messages
    if (room._id !== currentRoomId) {
      setCurrentRoomId(room._id);
      setMessages([]);
      setPage(1);
      setHasMore(true);

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
        } else {
          // Pagination: prepend older messages
          setMessages((prev) => [...data.messages, ...prev]);
        }

        // If fewer messages than page size received, no more messages to load
        if (data.messages.length < 20) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

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
            // For system messages, no need to mark as seen
            if (msg.messageType === 'SYSTEM' || msg.messageType === 'ORDER_STATUS' || msg.messageType === 'PAYMENT_STATUS') {
              return [...prev, msg];
            }

            // Mark as seen if message not sent by me
            if (msg.sender?._id !== myUserId) {
              socket.emit("markMessagesAsSeen", { roomId: msg.chatRoom });
            }
            return [...prev, msg];
          }
          return prev;
        });

        // Scroll to bottom for new messages
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
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
  }, [room, socket, currentRoomId, page, myUserId]);

  // Scroll to bottom when messages update (new messages)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!room) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-gray-500">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="w-2/3 flex flex-col">
      {/* Chat header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-2">
          <Image
            src={room.participants[0]?.profileImage}
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
          <h3 className="font-medium">{room.participants[0]?.userName}</h3>
        </div>
      </div>

      {/* Messages container */}
      <div
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {loadingMore && (
          <div className="text-center text-gray-500 text-sm py-2">
            Loading more...
          </div>
        )}

        {messages.map((msg, idx) => {
          const isSentByMe = msg.sender?._id === myUserId;
          const seenUsers = msg.seenBy?.filter((id) => id !== myUserId) || [];
          const isSeen = isSentByMe && seenUsers.length > 0;

          // Handle system messages
          if (msg.messageType === 'SYSTEM' || msg.messageType === 'ORDER_STATUS' || msg.messageType === 'PAYMENT_STATUS' || msg.messageType === 'SHIPPING_STATUS') {
            const getStatusIcon = () => {
              switch (msg.systemMeta?.theme) {
                case 'success':
                  return <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                case 'warning':
                  return <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                case 'error':
                  return <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                default:
                  return <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
              }
            };

            const getStatusColor = () => {
              switch (msg.systemMeta?.theme) {
                case 'success': return 'bg-green-50 border-green-200';
                case 'warning': return 'bg-yellow-50 border-yellow-200';
                case 'error': return 'bg-red-50 border-red-200';
                case 'info': return 'bg-blue-50 border-blue-200';
                default: return 'bg-gray-50 border-gray-200';
              }
            };

            return (
              <div key={msg._id || idx} className="flex justify-center my-4">
                <div className={`rounded-lg p-4 shadow-sm max-w-[80%] border ${getStatusColor()}`}>
                  {/* System Message Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      {msg.systemMeta?.icon ? (
                        <img src={msg.systemMeta.icon} alt="status" className="w-5 h-5" />
                      ) : getStatusIcon()}
                    </div>
                    <div className="font-medium">
                      {msg.systemMeta?.statusType === 'ORDER' && 'Order Status Update'}
                      {msg.systemMeta?.statusType === 'PAYMENT' && 'Payment Status Update'}
                      {msg.systemMeta?.statusType === 'SHIPPING' && 'Shipping Status Update'}
                      {msg.systemMeta?.statusType === 'SYSTEM' && 'System Notification'}
                      {msg.systemMeta?.statusType === 'PRODUCT' && 'Product Update'}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="text-sm">
                    {msg.content}
                  </div>

                  {/* Product Details if present */}
                  {msg.systemMeta?.productId && (
                    <div className="mt-2 p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        {msg.systemMeta.productImage && (
                          <img src={msg.systemMeta.productImage} alt={msg.systemMeta.productName} className="w-12 h-12 object-cover rounded" />
                        )}
                        <div>
                          <div className="font-medium">{msg.systemMeta.productName}</div>
                          {msg.systemMeta.price && (
                            <div className="text-sm text-gray-600">${msg.systemMeta.price.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Metadata */}
                  {msg.systemMeta?.meta && Object.keys(msg.systemMeta.meta).length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {Object.entries(msg.systemMeta.meta).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="font-medium">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {msg.systemMeta?.actions && msg.systemMeta.actions.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {msg.systemMeta.actions.map((action, index) => (
                        <a
                          key={index}
                          href={action.url}
                          className={`px-3 py-1 rounded text-sm ${action.type === 'primary'
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {action.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Handle product messages
          if (msg.messageType === 'PRODUCT') {
            return (
              <div key={msg._id || idx} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} my-2`}>
                <div className={`rounded-lg p-3 max-w-[70%] ${isSentByMe ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                  <div className="flex items-start gap-3 border rounded p-2 bg-white">
                    <img
                      src={getFullMediaUrl(msg.systemMeta?.productImage)}
                      alt={msg.systemMeta?.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{msg.systemMeta?.productName}</p>
                      <p className="text-gray-600">${msg.systemMeta?.price}</p>
                      <button
                        onClick={() => window.open(`/product/${msg.systemMeta?.productId}`, '_blank')}
                        className="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        View Product
                      </button>
                    </div>
                  </div>
                  {isSeen && (
                    <div className="flex justify-end mt-1">
                      <TiTick className="text-blue-300" />
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Handle file messages (images, videos, audio)
          if (['IMAGE', 'VIDEO', 'AUDIO', 'FILE'].includes(msg.messageType)) {
            return (
              <div key={msg._id || idx} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} my-2`}>
                <div className={`rounded-lg p-3 max-w-[70%] ${isSentByMe ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                  {msg.messageType === 'IMAGE' && (
                    <img
                      src={getFullMediaUrl(msg.content)}
                      alt="Shared image"
                      className="max-w-full w-52 h-52 rounded cursor-pointer hover:opacity-90"
                      onClick={() => window.open(getFullMediaUrl(msg.content), '_blank')}
                    />
                  )}
                  {msg.messageType === 'VIDEO' && (
                    <video
                      controls
                      className="max-w-full rounded"
                      src={getFullMediaUrl(msg.content)}
                    />
                  )}
                  {msg.messageType === 'AUDIO' && (
                    <audio
                      controls
                      className="max-w-full"
                      src={getFullMediaUrl(msg.content)}
                    />
                  )}
                  {msg.messageType === 'FILE' && (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <a
                        href={getFullMediaUrl(msg.content)}
                        download={msg.fileName}
                        className="underline hover:text-blue-100"
                      >
                        {msg.fileName || 'Download file'}
                      </a>
                    </div>
                  )}
                  {isSeen && (
                    <div className="flex justify-end mt-1">
                      <TiTick className="text-blue-300" />
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Regular text messages
          return (
            <div key={msg._id || idx} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} my-2`}>
              <div className={`rounded-lg p-3 max-w-[30%] ${isSentByMe ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                <p className="break-words whitespace-pre-wrap">
                  {msg.content}
                </p>
                {isSeen && (
                  <div className="flex justify-end mt-1">
                    <TiTick className="text-blue-300" />
                  </div>
                )}
              </div>
            </div>

          );
        })}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Message input box */}
      <MessageInput socket={socket} room={room} />
    </div>
  );
}
