import React, { useState, useEffect } from 'react';
import { Download, Box, Key, User, Lock, LogIn } from 'lucide-react';
import Sidebar from './components/Sidebar';
import PromptInput from './components/PromptInput';
import LandingPage from './components/LandingPage';
import Viewer from './components/Viewer';
import Toast from './components/Toast';
import api from './api';

function App() {
  const [session, setSession] = useState(null); // { id: 1 }
  const [messages, setMessages] = useState([]);
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null); // { message, type }

  const viewerRef = React.useRef(null);

  // No Auth State needed
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');
  // const [loggedIn, setLoggedIn] = useState(true); 

  // Initial check
  useEffect(() => {
    // api.get('/').catch(console.error);
  }, []);

  // Removed handleLogin

  const sendMessage = async (text) => {
    setLoading(true);
    const newMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, newMsg]);

    try {
      let imageData = null;
      // If refinement (session exists and we have a model), capture snapshot
      if (session?.id && modelUrl && viewerRef.current) {
        console.log("Capturing snapshot for refinement...");
        imageData = viewerRef.current.captureSnapshot();
      }

      const res = await api.post('/generate', {
        prompt: text,
        session_id: session?.id,
        image: imageData
      });

      const data = res.data;
      setSession({ id: data.session_id });

      if (data.error) {
        // Handle execution error (200 OK but logic failed)
        const errorMsg = { role: 'model', content: `Error: ${data.error}` };
        setMessages(prev => [...prev, errorMsg]);
        setToast({ message: data.error, type: 'error' });
      } else {
        const modelMsg = {
          role: 'model',
          content: 'Model Generated',
          code: data.code
        };
        setMessages(prev => [...prev, modelMsg]);
        setModelUrl(data.glb_url);
      }

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message;
      const errorMsg = { role: 'model', content: `Error: ${msg}` };
      setMessages(prev => [...prev, errorMsg]);
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    if (!session?.id) return;

    try {
      window.open(`http://localhost:8000/api/download/${session.id}?format=${format}`, '_blank');
    } catch (err) {
      alert("Download failed");
    }
  };

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <Sidebar
        messages={messages}
        onNewChat={() => { setMessages([]); setSession(null); setModelUrl(null); }}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Header / Toolbar Overlay */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {session && (
            <>
              <button onClick={() => handleDownload('stl')} className="bg-gray-900/80 backdrop-blur hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm border border-gray-700 flex items-center gap-2 shadow-lg transition-all">
                <Download size={16} /> <span className="hidden sm:inline">STL</span>
              </button>
              <button onClick={() => handleDownload('gltf')} className="bg-gray-900/80 backdrop-blur hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm border border-gray-700 flex items-center gap-2 shadow-lg transition-all">
                <Download size={16} /> <span className="hidden sm:inline">GLTF</span>
              </button>
            </>
          )}
        </div>

        {/* 3D Viewer Area - Takes available space */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
          {/* If no model, show placeholder or history of conversation? 
               Actually user wants "Viewer should allow for seeing the query provided". 
               Maybe we overlay the conversation or keep it clean?
               Let's show the Viewer always. If empty, it's just a grid.
           */}
          <Viewer modelUrl={modelUrl} ref={viewerRef} />

          {/* Overlay Toast for latest message if from model? */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20 pointer-events-none">
              <div className="bg-gray-900 border border-gray-700 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                <span className="text-sm font-medium text-blue-200">Generating Model...</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="bg-gray-900 border-t border-gray-800">
          <PromptInput onSend={sendMessage} loading={loading} />
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
