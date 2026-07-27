import React from 'react';
import useWebSocketHook from './useWebSocketHook';

const MyComponent = () => {
    const socketUrl = 'ws://192.168.68.133:3001';
    const { messages, connectionStatus, isLoading,lastMessage } = useWebSocketHook();
        console.log(messages)
    return (
        <div>
            {/* ... UI elements ... */}
            <div>Connection Status: {connectionStatus}</div>

            {isLoading && <div>Connecting...</div>}

            <div>
                <h2>Messages:</h2>
                <ul>
                    {messages.map((message, index) => (
                        <li key={index}>
                             {JSON.stringify(message) }
                        </li>
                    ))}
                </ul>
            </div>

            {/* ... message list and send message functionality ... */}
        </div>
    );
};

export default MyComponent;