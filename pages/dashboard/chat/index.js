import { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { customAPICall, getList } from '../../../api/xplorzApi';
import Seo from '../../../components/common/Seo';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { sendToast } from '../../../utils/toastify';

const ChatPage = () => {
  // Client traveller selection
  const [clientID, setClientID] = useState(null);
  const [clientOrgs, setClientOrgs] = useState([]);
  const [clientTravellers, setClientTravellers] = useState([]);
  const [selectedTraveller, setSelectedTraveller] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch client organizations on mount
  useEffect(() => {
    getClientOrgs();
  }, []);

  const getClientOrgs = async () => {
    const response = await getList('organizations', { is_client: 1 });
    if (response?.success) {
      setClientOrgs(
        response.data.map((element) => ({
          value: element.id,
          label: element.code ? `${element.name} (${element.code})` : element.name,
        }))
      );
    } else {
      sendToast('error', 'Unable to fetch client organizations', 4000);
    }
  };

  // Fetch client travellers when client changes
  useEffect(() => {
    if (clientID?.value) {
      getClientTravellers();
    } else {
      setClientTravellers([]);
      setSelectedTraveller(null);
    }
  }, [clientID]);

  const getClientTravellers = async () => {
    const response = await getList('client-travellers', {
      client_id: clientID?.value,
    });
    if (response?.success) {
      setClientTravellers(
        response.data.map((element) => ({
          value: element.id,
          label: element.traveller_name,
        }))
      );
      setSelectedTraveller(null);
    } else {
      sendToast('error', 'Error getting client travellers', 4000);
    }
  };

  // Handle starting a new conversation
  const handleNewConversation = () => {
    setMessages([]);
    setThreadId(null);
    setInputMessage('');
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedTraveller?.value || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
    ]);

    setIsLoading(true);

    try {
      // Build request payload
      const payload = {
        message: userMessage,
      };

      // Add threadId if we have one (subsequent messages)
      if (threadId) {
        payload.threadId = threadId;
      } else {
        payload.client_traveller_id = selectedTraveller.value;
      }

      // Make API call to agent/v1/chat endpoint
      const response = await customAPICall(
        'agent/v1/chat',
        'post',
        payload,
        {},
        true // airplaneCalls = true for NEXT_PUBLIC_TRAVEL_URL
      );

      if (response?.success) {
        // Store threadId from response
        if (response.data?.threadId) {
          setThreadId(response.data.threadId);
        }

        // Add assistant message to chat
        switch (response.data?.response?.type) {
          case 'text':
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: response.data?.response?.content || response.data?.message || 'No response',
                timestamp: new Date().toISOString(),
              },
            ]);
            break;
          case 'list':
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: response.data?.response?.items.join('\n* ') || response.data?.message || 'No response',
                timestamp: new Date().toISOString(),
              },
            ]);
            break;
          case 'data':
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: JSON.stringify(response.data?.response?.data || response.data?.message || {}),
                timestamp: new Date().toISOString(),
              },
            ]);
            break;
        }
      } else {
        sendToast(
          'error',
          response.data?.message || response.data?.error || 'Failed to get response',
          4000
        );
        // Add error message to chat
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date().toISOString(),
            isError: true,
          },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      sendToast('error', 'Failed to send message', 4000);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle keyboard input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Inline styles for chat-specific elements (minimal custom styles)
  const styles = {
    chatContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 280px)',
      minHeight: '500px',
    },
    messagesArea: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    placeholder: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    },
    messageRow: {
      display: 'flex',
      gap: '12px',
      maxWidth: '85%',
    },
    messageRowUser: {
      alignSelf: 'flex-end',
      flexDirection: 'row-reverse',
    },
    messageRowAssistant: {
      alignSelf: 'flex-start',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      flexShrink: 0,
    },
    avatarUser: {
      background: 'linear-gradient(135deg, #3554d1 0%, #2541b2 100%)',
    },
    avatarAssistant: {
      background: 'linear-gradient(135deg, #f0f2f5 0%, #e4e6e9 100%)',
    },
    messageBubble: {
      padding: '14px 18px',
      borderRadius: '18px',
      lineHeight: 1.5,
      fontSize: '15px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
    messageBubbleUser: {
      background: 'linear-gradient(135deg, #3554d1 0%, #2541b2 100%)',
      color: 'white',
      borderBottomRightRadius: '4px',
    },
    messageBubbleAssistant: {
      background: 'linear-gradient(135deg, #f0f2f5 0%, #e8eaed 100%)',
      color: '#1a1a1a',
      borderBottomLeftRadius: '4px',
    },
    messageBubbleError: {
      background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      color: '#991b1b',
    },
    messageTime: {
      fontSize: '11px',
      color: '#8c8c8c',
      padding: '0 8px',
    },
    inputContainer: {
      display: 'flex',
      gap: '12px',
      marginTop: 'auto',
    },
    textInput: {
      flex: 1,
      padding: '14px 18px',
      border: '2px solid #e8eaed',
      borderRadius: '24px',
      fontSize: '15px',
      resize: 'none',
      outline: 'none',
      fontFamily: 'inherit',
      minHeight: '50px',
      maxHeight: '150px',
    },
    sendButton: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      border: 'none',
      background: 'linear-gradient(135deg, #3554d1 0%, #2541b2 100%)',
      color: 'white',
      fontSize: '20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    sendButtonDisabled: {
      background: '#d1d5db',
      cursor: 'not-allowed',
    },
    typingDot: {
      width: '8px',
      height: '8px',
      background: '#8c8c8c',
      borderRadius: '50%',
      animation: 'typingBounce 1.4s ease-in-out infinite',
    },
  };

  return (
    <>
      <Seo pageTitle='Xplorz Assist' />
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        .chat-input:focus {
          border-color: #3554d1 !important;
          box-shadow: 0 0 0 3px rgba(53, 84, 209, 0.1);
        }
        .chat-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }
        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(53, 84, 209, 0.3);
        }
        /* Markdown styles for chat */
        .markdown-content {
          line-height: 1.1;
        }
        .markdown-content p {
          margin: 0 0 4px 0;
          color: inherit;
        }
        .markdown-content p:last-child {
          margin-bottom: 0;
        }
        .markdown-content ul, .markdown-content ol {
          margin: 0;
          padding-left: 20px;
        }
        .markdown-content li {
          margin: 0;
          list-style: disc;
        }
        .markdown-content ol li {
          list-style: decimal;
        }
        .markdown-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 0;
          font-size: 14px;
        }
        .markdown-content th, .markdown-content td {
          border: 1px solid #d1d5db;
          padding: 4px 6px;
          text-align: left;
        }
        .markdown-content th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        .markdown-content tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .markdown-content code {
          background-color: #e5e7eb;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
        }
        .markdown-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 8px 0;
        }
        .markdown-content pre code {
          background-color: transparent;
          padding: 0;
        }
        .markdown-content strong {
          font-weight: 600;
        }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
          margin: 12px 0 8px 0;
          font-weight: 600;
        }
        .markdown-content h1 { font-size: 1.5em; }
        .markdown-content h2 { font-size: 1.3em; }
        .markdown-content h3 { font-size: 1.1em; }
        .markdown-content blockquote {
          border-left: 3px solid #3554d1;
          padding-left: 12px;
          margin: 8px 0;
          color: #6b7280;
        }
        .markdown-content a {
          color: #3554d1;
          text-decoration: underline;
        }
      `}</style>

      <div className='dashboard__content d-flex flex-column bg-light-2' style={{ minHeight: '100vh' }}>
        <div className='row y-gap-20 justify-between items-end pb-20'>
          <div className='col-12'>
            <h1 className='text-30 lh-14 fw-600'>Xplorz Assist</h1>
            <div className='text-15 text-light-1'>
              Your AI-powered travel assistant
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className='py-20 px-30 rounded-4 bg-white shadow-3' style={styles.chatContainer}>
          {/* Traveller Selection */}
          <div className='row x-gap-10 y-gap-10 pb-20 border-bottom-light'>
            <div className='col-md-4'>
              <label className='text-15 fw-500 mb-5'>Client Organization</label>
              <Select
                options={clientOrgs}
                value={clientID}
                onChange={(id) => {
                  setClientID(id);
                  handleNewConversation();
                }}
                placeholder='Select Client'
                isClearable
              />
            </div>
            <div className='col-md-4'>
              <label className='text-15 fw-500 mb-5'>Traveller</label>
              <Select
                options={clientTravellers}
                value={selectedTraveller}
                onChange={(id) => {
                  setSelectedTraveller(id);
                  handleNewConversation();
                }}
                placeholder='Select Traveller'
                isDisabled={!clientID?.value}
                isClearable
              />
            </div>
            <div className='col-md-4 d-flex items-end'>
              <button
                className='button p-2 -dark-1 bg-blue-1 text-white h-50'
                onClick={handleNewConversation}
                disabled={!selectedTraveller?.value}
              >
                New Conversation
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className='py-20 scroll-bar-1' style={styles.messagesArea}>
            {!selectedTraveller?.value ? (
              <div style={styles.placeholder}>
                <div className='text-60 mb-20'>💬</div>
                <p className='text-18 fw-500 text-dark-1'>Select a traveller to start chatting</p>
                <p className='text-15 text-light-1'>
                  Choose a client organization and traveller from the dropdowns above
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div style={styles.placeholder}>
                <div className='text-60 mb-20'>🌍</div>
                <p className='text-18 fw-500 text-dark-1'>Welcome to Xplorz Assist!</p>
                <p className='text-15 text-light-1'>
                  Ask me anything about flights, hotels, or travel planning for {selectedTraveller.label}
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.messageRow,
                      ...(msg.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant),
                    }}
                  >
                    <div
                      style={{
                        ...styles.avatar,
                        ...(msg.role === 'user' ? styles.avatarUser : styles.avatarAssistant),
                      }}
                    >
                      {msg.role === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className='d-flex flex-column gap-1'>
                      <div
                        style={{
                          ...styles.messageBubble,
                          ...(msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant),
                          ...(msg.isError ? styles.messageBubbleError : {}),
                        }}
                      >
                        {msg.role === 'assistant' ? (
                          <div className='markdown-content'>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                      <div
                        style={{
                          ...styles.messageTime,
                          textAlign: msg.role === 'user' ? 'right' : 'left',
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div style={{ ...styles.messageRow, ...styles.messageRowAssistant }}>
                    <div style={{ ...styles.avatar, ...styles.avatarAssistant }}>🤖</div>
                    <div
                      className='d-flex gap-1 items-center'
                      style={{ ...styles.messageBubble, ...styles.messageBubbleAssistant }}
                    >
                      <span style={{ ...styles.typingDot, animationDelay: '0s' }}></span>
                      <span style={{ ...styles.typingDot, animationDelay: '0.2s' }}></span>
                      <span style={{ ...styles.typingDot, animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className='pt-20 border-top-light' style={styles.inputContainer}>
            <textarea
              ref={inputRef}
              className='chat-input'
              style={styles.textInput}
              placeholder={
                selectedTraveller?.value
                  ? 'Type your message...'
                  : 'Select a traveller to start chatting'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!selectedTraveller?.value || isLoading}
              rows={1}
            />
            <button
              className='send-btn'
              style={{
                ...styles.sendButton,
                ...(!inputMessage.trim() || !selectedTraveller?.value || isLoading
                  ? styles.sendButtonDisabled
                  : {}),
              }}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !selectedTraveller?.value || isLoading}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

ChatPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ChatPage;
