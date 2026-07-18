import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket ,  { ReadyState }from 'react-use-websocket';

const useWebSocketHook = () => {
    const [messages, setMessageHistory] = useState([]);
    const [readyState, setReadyState] = useState(ReadyState.CLOSED); // Initial state

    const { sendMessage, lastMessage } = useWebSocket(process.env.REACT_APP_SOCKET_URL, {
        onOpen: () => setReadyState(ReadyState.OPEN),
        onClose: () => setReadyState(ReadyState.CLOSED),
        onError: (error) => console.error('Error:', error),
        shouldReconnect: () => true,
        reconnectInterval: 5000,
        share: true
    });

    // State for the message to be sent
    const [inputMessage, setInputMessage] = useState('');

    useEffect(() => {
        if (lastMessage !== null) {
            try {
                const parsedMessage = JSON.parse(lastMessage.data); // Convert to JSON
                setMessageHistory((prev) => [
                    ...prev,
                    {
                         ...parsedMessage,

                    },
                ]);
            } catch (error) {
                console.error("Failed to parse message as JSON:", error);
            }
        }
    }, [lastMessage]);


    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Connected',
        [ReadyState.CLOSING]: 'Disconnecting',
        [ReadyState.CLOSED]: 'Disconnected'
    }[readyState];

    const isLoading = readyState === ReadyState.CONNECTING; // Indicate loading

    return {
        messages,
        connectionStatus,
        isLoading,
        lastMessage
    };
};

export default useWebSocketHook;