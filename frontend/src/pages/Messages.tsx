import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MessageSquare, Send, ArrowLeft, User, Loader2, 
  Clock, CheckCheck, Home
} from 'lucide-react'
import api from '../services/api'
import { formatRelativeTime } from '../utils/formatters'
import type { Conversation, Message } from '../types'
import toast from 'react-hot-toast'
import { ScamWarningBanner } from '../components/security/ScamWarningBanner'

export default function Messages() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [scamWarning, setScamWarning] = useState<string[] | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.property_id, selectedConversation.other_user_id)
    }
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/messages/conversations')
      setConversations(res.data)
    } catch (err) {
      console.error('Failed to fetch conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (propertyId: number, otherUserId: number) => {
    try {
      const res = await api.get(`/api/messages/${propertyId}/${otherUserId}`)
      setMessages(res.data)
    } catch (err) {
      console.error('Failed to fetch messages')
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    setSending(true)
    setScamWarning(null)
    try {
      const res = await api.post('/api/messages', {
        property_id: selectedConversation.property_id,
        receiver_id: selectedConversation.other_user_id,
        content: newMessage
      })
      if (res.data.warning) {
        setScamWarning(res.data.detected_keywords || [])
      }
      setNewMessage('')
      fetchMessages(selectedConversation.property_id, selectedConversation.other_user_id)
      fetchConversations()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Messages</h1>

        <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="border-r border-dark-800/50 overflow-y-auto">
              <div className="p-4 border-b border-dark-800/50">
                <h2 className="font-semibold text-dark-200">Conversations</h2>
              </div>
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-dark-700 mx-auto mb-3" />
                  <p className="text-dark-500 text-sm">No conversations yet</p>
                  <p className="text-dark-600 text-xs mt-1">Start by contacting a landlord</p>
                </div>
              ) : (
                <div className="divide-y divide-dark-800/30">
                  {conversations.map((conv) => (
                    <button
                      key={`${conv.property_id}-${conv.other_user_id}`}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 flex items-start gap-3 text-left transition-all hover:bg-dark-800/30 ${
                        selectedConversation?.property_id === conv.property_id && 
                        selectedConversation?.other_user_id === conv.other_user_id
                          ? 'bg-dark-800/50 border-l-2 border-brand-500'
                          : ''
                      }`}
                    >
                      <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {conv.other_user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-dark-100 text-sm truncate">{conv.other_user_name}</span>
                          <span className="text-xs text-dark-500 flex-shrink-0">{formatRelativeTime(conv.last_message_time)}</span>
                        </div>
                        <p className="text-xs text-brand-400 mt-0.5 truncate">{conv.property_title}</p>
                        <p className="text-sm text-dark-400 truncate mt-1">{conv.last_message}</p>
                        {conv.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full mt-1">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 flex flex-col h-full">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-dark-800/50 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden p-2 text-dark-400 hover:text-white"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {selectedConversation.other_user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-dark-100">{selectedConversation.other_user_name}</div>
                      <div 
                        className="text-xs text-brand-400 cursor-pointer hover:underline"
                        onClick={() => navigate(`/property/${selectedConversation.property_id}`)}
                      >
                        {selectedConversation.property_title}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {scamWarning && <ScamWarningBanner keywords={scamWarning} />}

                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="w-10 h-10 text-dark-700 mx-auto mb-3" />
                        <p className="text-dark-500 text-sm">No messages yet</p>
                        <p className="text-dark-600 text-xs mt-1">Start the conversation</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === selectedConversation.other_user_id ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                            msg.sender_id === selectedConversation.other_user_id
                              ? 'bg-dark-800 text-dark-200 rounded-tl-sm'
                              : 'bg-brand-600 text-white rounded-tr-sm'
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 text-xs ${
                              msg.sender_id === selectedConversation.other_user_id ? 'text-dark-500' : 'text-brand-200'
                            }`}>
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(msg.created_at)}
                              {msg.sender_id !== selectedConversation.other_user_id && msg.is_read && (
                                <CheckCheck className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-dark-800/50">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="input-field flex-1"
                      />
                      <button
                        onClick={handleSend}
                        disabled={sending || !newMessage.trim()}
                        className="btn-primary px-4"
                      >
                        {sending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-dark-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-dark-300 mb-2">Select a conversation</h3>
                    <p className="text-dark-500 text-sm">Choose a conversation from the list to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
