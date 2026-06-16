import React, { useState } from 'react';
import { Lock, Unlock, Phone, Trash2, Power, MessageSquare } from 'lucide-react';
import { useRemoteControl, useDevices, useAuth } from '../services';

export const RemoteControlWithAPI = () => {
  const { user } = useAuth();
  const { devices } = useDevices(user?.id);
  const activeDevice = devices?.[0];
  const { executeCommand, loading } = useRemoteControl(activeDevice?.id);
  const [messageText, setMessageText] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);

  const commands = [
    {
      id: 'lock',
      label: 'Lock Device',
      icon: Lock,
      color: '#39FF14',
      description: 'Secure your device immediately',
      onClick: () => executeCommand('lock'),
    },
    {
      id: 'unlock',
      label: 'Unlock Device',
      icon: Unlock,
      color: '#FF9F00',
      description: 'Unlock with 2FA verification',
      onClick: () => executeCommand('unlock'),
    },
    {
      id: 'ring',
      label: 'Ring Device',
      icon: Phone,
      color: '#00D4FF',
      description: 'Play loud alarm sound',
      onClick: () => executeCommand('ring'),
    },
    {
      id: 'wipe',
      label: 'Wipe Data',
      icon: Trash2,
      color: '#FF0000',
      description: 'Erase all data (irreversible)',
      onClick: () => {
        if (window.confirm('Are you sure? This cannot be undone!')) {
          executeCommand('wipe');
        }
      },
    },
    {
      id: 'power',
      label: 'Power Off',
      icon: Power,
      color: '#FF6B6B',
      description: 'Turn device off',
      onClick: () => executeCommand('power'),
    },
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      executeCommand('message', { text: messageText });
      setMessageText('');
      setShowMessageInput(false);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="space-y-2 mb-6">
        <h2 className="text-white text-xl font-semibold">Remote Control</h2>
        <p className="text-gray-400 text-sm">
          {activeDevice?.name || 'No device selected'}
        </p>
      </div>

      {/* Command Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commands.map((cmd) => {
          const IconComponent = cmd.icon;
          return (
            <button
              key={cmd.id}
              onClick={cmd.onClick}
              disabled={loading || !activeDevice}
              className="p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed group"
              style={{
                background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.05) 0%, rgba(255, 159, 0, 0.02) 100%)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded group-hover:scale-110 transition"
                  style={{ background: `${cmd.color}20` }}
                >
                  <IconComponent size={24} style={{ color: cmd.color }} />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold">{cmd.label}</h3>
                  <p className="text-xs text-gray-400 mt-1">{cmd.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Message Input */}
      <div
        className="rounded-lg p-4 border border-gray-700"
        style={{
          background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.05) 0%, rgba(255, 159, 0, 0.02) 100%)',
        }}
      >
        <button
          onClick={() => setShowMessageInput(!showMessageInput)}
          className="w-full flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition"
        >
          <MessageSquare size={20} style={{ color: '#39FF14' }} />
          <span className="text-white font-semibold">Display Message</span>
        </button>

        {showMessageInput && (
          <div className="mt-4 space-y-3 p-3 rounded bg-gray-900/50">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter message to display on device..."
              maxLength={160}
              className="w-full bg-gray-800 text-white rounded p-2 text-sm border border-gray-700 focus:border-gray-600 focus:outline-none resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {messageText.length}/160 characters
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMessageInput(false)}
                  className="px-3 py-2 rounded text-sm text-gray-400 hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || loading}
                  className="px-3 py-2 rounded text-sm bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 transition"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning */}
      <div
        className="rounded-lg p-4 border-l-4 bg-red-900/20"
        style={{ borderColor: '#FF0000' }}
      >
        <p className="text-sm text-red-300">
          ⚠️ <strong>Warning:</strong> Remote commands are irreversible. Ensure you are performing the correct action on the correct device.
        </p>
      </div>
    </div>
  );
};

export default RemoteControlWithAPI;
