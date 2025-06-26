import React, { useState } from 'react';

export default function MessageInput({ socket, room }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    socket.emit('sendMessage', {
      roomId: room._id,
      type: 'TEXT',
      content: text
    });
    setText('');
  };

  return (
    <div className="p-4 border-t flex gap-2">
      <input
        className="flex-1 border rounded-md p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        placeholder="Type a message..."
      />
      <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded-md">
        Send
      </button>
    </div>
  );
}
