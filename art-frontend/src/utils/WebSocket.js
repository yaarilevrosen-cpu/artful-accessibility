import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';

const WebSocket = () => {
    const [socketUrl] = useState('ws://192.168.68.135:3001');
    const [messageHistory, setMessageHistory] = useState([]);
    const [inputMessage, setInputMessage] = useState('');

    const {
        sendMessage,
        lastMessage,
        readyState
    } = useWebSocket(socketUrl, {
        onOpen: () => console.log('Connected'),
        onClose: () => console.log('Disconnected'),
        onError: (error) => console.error('Error:', error),
        shouldReconnect: () => true,
        reconnectInterval: 5000,
        share: true
    });

    useEffect(() => {
        if (lastMessage !== null) {
            setMessageHistory((prev) => [...prev, {
                message: lastMessage.data,
                time: new Date().toLocaleTimeString(),
                type: 'received'
            }]);
        }
    }, [lastMessage]);

    const handleSendMessage = useCallback(() => {
        if (inputMessage.trim()) {
            sendMessage(inputMessage);
            setMessageHistory((prev) => [...prev, {
                message: inputMessage,
                time: new Date().toLocaleTimeString(),
                type: 'sent'
            }]);
            setInputMessage('');
        }
    }, [inputMessage, sendMessage]);

    const connectionStatus = {
        0: 'Connecting',
        1: 'Connected',
        2: 'Disconnecting',
        3: 'Disconnected'
    }[readyState];

    return (
        <div className="p-4">
            <div className="mb-4">
        <span className={`px-3 py-1 rounded ${
            readyState === 1 ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {connectionStatus}
        </span>
            </div>

            <div className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded"
                    disabled={readyState !== 1}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={readyState !== 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    Send
                </button>
            </div>

            <div className="border rounded p-4 h-96 overflow-y-auto">
                {messageHistory.map((message, idx) => (
                    <div
                        key={idx}
                        className={`mb-2 p-2 rounded max-w-[80%] ${
                            message.type === 'sent'
                                ? 'ml-auto bg-blue-100'
                                : 'bg-gray-100'
                        }`}
                    >
                        <div>{message.message}</div>
                        <div className="text-xs text-gray-500">{message.time}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WebSocket;