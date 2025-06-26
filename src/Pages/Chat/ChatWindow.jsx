// import React, { useEffect, useRef, useState } from "react";
// import MessageInput from "./MessageInput";
// import { TiTick } from "react-icons/ti";
// import Image from "../../Component/Atoms/Image/Image";
// export default function ChatWindow({ room, socket }) {
//   const [messages, setMessages] = useState([]);
//   const [currentRoomId, setCurrentRoomId] = useState(null);
//   const messagesEndRef = useRef();
//   let myUserId = JSON.parse(localStorage.getItem("kadSunInfo"))?.userId;
//   console.log("messages", messages);

//   useEffect(() => {
//     if (!room) {
//       setMessages([]);
//       setCurrentRoomId(null);
//       return;
//     }

//     // Only fetch messages if switching to a different room
//     if (room._id !== currentRoomId) {
//       setCurrentRoomId(room._id);
//       setMessages([]); // Clear messages when switching rooms

//       socket.emit("getMessagesWithUser", {
//         otherUserId: room.participants[0]?._id,
//         pageNo: 1,
//         size: 50,
//       });
//     }

//     // Handle messageList response (initial load)
//     const handleMessageList = (data) => {
//       // Only update if this is for the current room
//       if (data.chatRoomId === room._id || (data.isNewRoom && room._id)) {
//         setMessages(data.messages || []);
//         // Mark messages as seen if there's a room
//         if (data.chatRoomId) {
//           socket.emit("markMessagesAsSeen", { roomId: data.chatRoomId });
//         }
//       }
//     };

//     // Handle new messages
//     const handleNewMessage = (msg) => {
//       console.log("Received newMessage:", msg);
//       // Only add message if it's for the current room
//       if (msg.chatRoom === room._id) {
//         setMessages((prev) => {
//           // Check if message already exists to avoid duplicates
//           const messageExists = prev.some(
//             (existingMsg) =>
//               existingMsg._id === msg._id ||
//               (existingMsg.content === msg.content &&
//                 existingMsg.sender?._id === msg.sender?._id &&
//                 Math.abs(
//                   new Date(existingMsg.createdAt) - new Date(msg.createdAt)
//                 ) < 1000)
//           );

//           if (!messageExists) {
//             // Mark as seen if not sent by current user
//             if (msg.sender?._id !== myUserId) {
//               socket.emit("markMessagesAsSeen", { roomId: msg.chatRoom });
//             }

//             return [...prev, msg];
//           }
//           return prev;
//         });
//       }
//     };

//     socket.on("messagesSeen", ({ roomId, userId, seenAt }) => {
//       if (roomId === currentRoomId) {
//         setMessages((prevMessages) => {
//           return prevMessages.map((msg) => {
//             // If the message is not sent by the user who marked it as seen
//             if (msg.chatRoom === roomId && msg.sender?._id !== userId) {
//               // Update the seenBy array
//               if (!msg.seenBy.includes(userId)) {
//                 msg.seenBy.push(userId);
//               }
//             }
//             return msg;
//           });
//         });
//       }
//     });

//     socket.on("messageList", handleMessageList);
//     socket.on("newMessage", handleNewMessage);

//     return () => {
//       socket.off("messageList", handleMessageList);
//       socket.off("newMessage", handleNewMessage);
//       socket.off("messagesSeen", () => {}); // Clean up listener on unmount
//     };
//   }, [room, socket, currentRoomId]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   if (!room) {
//     return (
//       <div className="flex-1 p-4 flex items-center justify-center text-gray-500">
//         Select a chat to start messaging
//       </div>
//     );
//   }

//   return (
//     <div className="w-2/3 flex flex-col">
//       <div className="bg-white border-b p-4">
//         <div className="flex items-center gap-2">
//           <Image
//             src={room.participants[0]?.profileImage}
//             alt="avatar"
//             className="w-8 h-8 rounded-full"
//           />
//           <h3 className="font-medium">{room.participants[0]?.userName}</h3>
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-2">
//         {messages.map((msg, idx) => {
//           const isSentByMe = msg.sender?._id === myUserId;
//           const seenUsers = msg.seenBy?.filter((id) => id !== myUserId);
//           const isSeen = isSentByMe && seenUsers.length > 0;

//           return (
//             <div
//               key={msg._id || idx}
//               className={`max-w-[70%] p-2 rounded-lg ${
//                 isSentByMe ? "bg-blue-400 text-white ml-auto" : "bg-gray-200"
//               }`}
//             >
//               <div>{msg.content}</div>

//               <div className="flex items-center justify-between text-xs opacity-70 mt-1">
//                 <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>

//                 {/* Tick icon only for messages sent by me */}
//                 {isSentByMe && (
//                   <span className="ml-2">
//                     {isSeen ? (
//                       <span className="text-blue-700 text-xs flex">
//                         <TiTick />
//                         <TiTick />
//                       </span> // blue double tick
//                     ) : (
//                       <span className="text-gray-600 flex">
//                         <TiTick />
//                         <TiTick />
//                       </span> // gray single tick
//                     )}
//                   </span>
//                 )}
//               </div>
//             </div>
//           );
//         })}

//         <div ref={messagesEndRef}></div>
//       </div>

//       <MessageInput socket={socket} room={room} />
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput";
import { TiTick } from "react-icons/ti";
import Image from "../../Component/Atoms/Image/Image";

export default function ChatWindow({ room, socket }) {
  const [messages, setMessages] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const messagesEndRef = useRef();
  const messageContainerRef = useRef();

  let myUserId = JSON.parse(localStorage.getItem("kadSunInfo"))?.userId;

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
            // Mark as seen if message not sent by me
            if (msg.sender?._id !== myUserId) {
              socket.emit("markMessagesAsSeen", { roomId: msg.chatRoom });
            }
            return [...prev, msg];
          }
          return prev;
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

          return (
            <div
              key={msg._id || idx}
              className={`max-w-[70%] p-2 rounded-lg ${
                isSentByMe ? "bg-blue-400 text-white ml-auto" : "bg-gray-200"
              }`}
            >
              <div>{msg.content}</div>

              <div className="flex items-center justify-between text-xs opacity-70 mt-1">
                <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>

                {/* Tick icon only for messages sent by me */}
                {isSentByMe && (
                  <span className="ml-2">
                    {isSeen ? (
                      <span className="text-blue-700 text-xs flex">
                        <TiTick />
                        <TiTick />
                      </span>
                    ) : (
                      <span className="text-gray-600 flex">
                        <TiTick />
                        <TiTick />
                      </span>
                    )}
                  </span>
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
