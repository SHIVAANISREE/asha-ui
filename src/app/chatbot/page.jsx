'use client';
import { useState, useRef, useEffect } from 'react';
import {Send, Copy, Tag, Search, ChevronDown, Settings, LogOut, User, Check} from 'lucide-react';
import { Typewriter } from 'react-simple-typewriter';
import { sendChatMessage, tagMessage, removeTag, fetchTags, fetchMessagesByTag  } from '../services/chatServices';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique message IDs
// export const sendChatMessage = async (message, message_id) => {
export const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [message_id, setMessageId] = useState(uuidv4());
  const [input, setInput] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [taggedMessages, setTaggedMessages] = useState([]);
  const [activeTagInput, setActiveTagInput] = useState(null); // message id
  const [tagInput, setTagInput] = useState(''); // tag input text
  const [isTagged, setIsTagged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add a welcome message when component mounts
  useEffect(() => {
    setMessages([
      {
        id: uuidv4(), // Unique ID for the message
        role: 'ai',
        text: 'Hi there! I\'m Asha AI. How can I help you with your career today?'
      }
    ]);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTags = tags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClick = async () => {
    if (!showPopup) {
      const loadedTags = await fetchTags();
      setTags(loadedTags);
    }
    setShowPopup(prev => !prev);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessageId(uuidv4());
    const userMessage = { 
      id: message_id, 
      role: 'user', 
      text: input 
    };
    console.log("message id:", message_id, userMessage.id);
    
    // Add user message to the messages array
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    let aiResponse = '';
    if(message_id != null && message_id != "" && message_id != undefined) {
       // Simulate sending the message and getting an AI response
      aiResponse = await sendChatMessage(userMessage.text, userMessage.id);
    }
   

    const aiMessage = { 
      id: message_id, 
      role: 'ai', 
      text: aiResponse 
    };

    // Add AI message to the messages array
    setMessages((prev) => [...prev, aiMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    console.log("message id:", idx)

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedIdx(null);
    }, 2000);
  };
  const handleSelectedTag = async (tag) => {
    setSearchTerm(tag);
    setShowPopup(false);
    setMessages([]);

  
    const taggedData = await fetchMessagesByTag(tag);
  
    const formattedMessages = taggedData.flatMap((item) => {
      const userMessage = {
        id: item.message_id || item._id, // fallback to _id if message_id is empty
        role: 'user',
        text: item.question || '',
      };
  
      const aiMessage = {
        id: item.message_id,
        role: 'ai',
        text: item.answer || '',
      };
  
      return [userMessage, aiMessage];
    });
  
    setMessages(formattedMessages);
  };
  

  const addTagToMessage = async (messageId, tag) => {
    try {
      // Replace this with your actual API call
      setIsTagged(true);
      console.log("tag is called");
      const response = await tagMessage(messageId, tag);
      const result = await response.json();
      console.log('Tag added:', result);
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const removeTaggedMessage = async (messageId) => {
    setIsTagged(false);
    console.log("remove tag");
    const response = await removeTag(messageId);
  }
  

  const toggleTag = async (messageId) => {
    if(isTagged) {
      setIsTagged(false);
      removeTaggedMessage(messageId);
    } else {
      setIsTagged(true);
    }
  };

  const loadTags = async () => {
    const tagList = await fetchTags();
    setTags(tagList);
  };

  const handleTagClick = (tag) => {
    setSearchTerm(tag);
    setShowPopup(false);
  };

  return (
    <div className="min-h-screen  text-white flex flex-col bg-custom">
      {/* Header */}
      <header className="bg-transparent w-full px-8 py-2 flex items-center justify-between ">
        {/* Left: Logo + Title + Search */}
        <div className="flex items-center gap-6">
          {/* Logo with subtle glow effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 blur-sm"></div>
            <img 
              src="/logo.png" 
              alt="Asha AI Logo" 
              className="h-12 w-12 border-2 border-indigo-400 rounded-full object-contain relative z-10"
            />
          </div>

          {/* Title with gradient text */}
          <h2 className="text-2xl font-bold whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-pink-700">
            Asha AI
          </h2>

          {/* Enhanced Search Bar */}
          <div className="relative" ref={containerRef}>
      <input
        type="text"
        placeholder="Search tags"
        onClick={handleClick}
        onChange={e => setSearchTerm(e.target.value)}
        value={searchTerm}
        className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-gray-700 transition-all duration-300 w-64 border border-gray-700"
      />
      <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />

      {showPopup && (
        <div className="absolute z-10 bg-gray-800 text-white border border-gray-700 rounded-md mt-1 w-64 max-h-48 overflow-y-auto shadow-lg">
          {tags
            .filter((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((tag, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSelectedTag(tag)}
              >
                {tag}
              </div>
            ))}
        </div>
      )}
    </div>
        </div>

        {/* Right: Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-pink-500 px-2 py-1 rounded-lg text-white font-medium  transition-all duration-200"
          >
            <div className="w-8 h-8 bg-indigo-800 rounded-full flex items-center justify-center text-white font-semibold border-2 border-indigo-400">
              A
            </div>
            <span>Account</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg shadow-xl z-10 overflow-hidden">
              <ul>
                <li className="flex items-center px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700">
                  <User className="h-4 w-4 mr-2 text-indigo-400" />
                  <span>Profile</span>
                </li>
                <li className="flex items-center px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700">
                  <Settings className="h-4 w-4 mr-2 text-indigo-400" />
                  <span>Settings</span>
                </li>
                <li className="flex items-center px-4 py-3 hover:bg-gray-700 cursor-pointer text-red-400">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex flex-col items-center h-[90vh] px-4 py-6" >
        {/* Typing Animation */}
        <div className="w-full max-w-4xl flex justify-center text-xl font-bold mb-4 h-6">
          <div className="bg-gradient-to-r from-indigo-700 via-pink-700 to-indigo-900 text-transparent bg-clip-text">
            <Typewriter
              words={[
                'Ask Asha about Career Advice...',
                'Job Opportunities...',
                'Tech Skills...',
              ]}
              loop={0}
              cursor
              cursorStyle="|"
              typeSpeed={50}
              deleteSpeed={30}
              delaySpeed={2000}
            />
          </div>
        </div>

        <div className="w-full max-w-4xl flex flex-col bg-gray-700/40 rounded-xl shadow-lg p-4 space-y-4 overflow-y-auto h-[70vh] scrollbar-hide">

          {messages.map((msg) => (
            <div key={msg.id} className="w-full flex">
              {msg.role === 'ai' ? (
                <div className="max-w-lg bg-gray-800 text-white rounded-lg p-4">
                  <div className="mb-2">
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{msg.text}</ReactMarkdown>
                  </div>
                  <div className="flex justify-end gap-2 mt-2 relative">
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="text-white hover:text-indigo-300"
                      title="Copy"
                    >
                      {copiedIdx === msg.id ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    {copiedIdx === msg.id && (
                      <div className="absolute bottom-full mb-1 text-xs bg-black text-white px-2 py-1 rounded shadow-md">
                        Copied
                      </div>
                    )}
                    <button
  onClick={() => {
    setActiveTagInput(msg.id);
    toggleTag(msg.id);
  }}
  disabled={loading}
  className="p-1"
  title={isTagged ? 'Remove Tag' : 'Add Tag'}
>
  {isTagged ? (
    <Tag size={16} className="text-amber-500 fill-amber-500" />
  ) : (
    <Tag size={16} className="text-white" />
  )}
</button>

  {activeTagInput === msg.id && isTagged && (
    <div className="absolute top-full mt-2 right-0 bg-gray-900 text-white p-4 rounded-lg shadow-lg border border-gray-700 z-20 w-64">
      <input
        type="text"
        placeholder="Enter tag"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            addTagToMessage(msg.id, tagInput);
            setActiveTagInput(null);
            setTagInput('');
          }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded"
        >
          Add Tag
        </button>
        <button
          onClick={() => {
            setActiveTagInput(null);
            setTagInput('');
          }}
          className="text-gray-400 hover:text-white text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )}
                  </div>
                </div>
              ) : (
                <div className="ml-auto max-w-md bg-indigo-500 text-white rounded-lg p-4">
                  <div>{msg.text}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="w-full max-w-4xl mt-6 flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask Asha about Career Guidance, Job Opportunities, Tech Skills..."
            className="flex-1 bg-gray-900 text-white border border-gray-600 rounded-full px-6 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            className="ml-4 bg-indigo-500 hover:bg-indigo-700 text-white px-4 py-3 rounded-full transition-all flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
