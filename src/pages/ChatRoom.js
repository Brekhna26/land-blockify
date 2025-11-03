import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FiSend, FiMic } from "react-icons/fi";
import "./ChatRoom.css";

export default function ChatRoom({ propertyId, userEmail }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (propertyId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [propertyId]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/messages?propertyId=${propertyId}`
      );
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    try {
      await axios.post(`http://localhost:3001/api/messages`, {
        propertyId,
        senderEmail: userEmail,
        message: newMsg,
      });
      setNewMsg("");
      fetchMessages();
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      alert("Audio recording not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      const audioChunks = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        formData.append("senderEmail", userEmail);
        formData.append("propertyId", propertyId);

        try {
          await axios.post("http://localhost:3001/api/messages/audio", formData);
          fetchMessages();
        } catch (error) {
          console.error("Audio upload error:", error);
        }

        setIsRecording(false);
        setMediaRecorder(null);
      };

      recorder.start();
      setIsRecording(true);
      setMediaRecorder(recorder);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Microphone access is required to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        Chat with user for Property: <span>{propertyId || "Unknown"}</span>
      </div>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-bubble ${
              msg.senderEmail === userEmail ? "own" : "other"
            }`}
          >
            <div className="sender">{msg.senderEmail}</div>
            {msg.type === "audio" ? (
              <audio controls>
                <source
                  src={`http://localhost:3001${msg.message}`}
                  type="audio/webm"
                />
              </audio>
            ) : (
              <div className="text">{msg.message}</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
        />
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          className="mic-btn"
          style={{ backgroundColor: isRecording ? "#ffb066ff" : "white" }}
          title="Hold to record"
        >
          <FiMic />
        </button>
        <button onClick={sendMessage} className="send-btn">
          <FiSend />
        </button>
      </div>
    </div>
  );
}
