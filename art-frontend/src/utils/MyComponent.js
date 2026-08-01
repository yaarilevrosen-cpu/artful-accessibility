import React from 'react';
import useWebSocketHook from './useWebSocketHook';

// Resolves the backend/inference host from whatever address the page
// was loaded from, so LAN and Tailscale both work with one build.
const h = typeof window !== 'undefined' ? window.location.hostname : '192.168.68.135';


const MyComponent = () => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || `ws://${h}:3001`;
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