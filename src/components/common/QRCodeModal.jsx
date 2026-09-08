import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useQuiz } from '../../context/QuizContext';
import { X, Copy, Check, Smartphone, Wifi, ExternalLink } from 'lucide-react';

export default function QRCodeModal({ onClose }) {
  const { sessionCode, serverInfo } = useQuiz();
  const [copied, setCopied] = useState(false);

  // Direct join URL with prefilled session code
  const joinUrl = `${serverInfo.joinUrl}?code=${sessionCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl animate-scale-in text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Smartphone className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">
            Join on Mobile / Tablet
          </h3>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          Connect your device to the same Wi-Fi network and scan the QR code to participate.
        </p>

        {/* QR Code Container */}
        <div className="inline-block p-4 bg-white rounded-2xl shadow-inner mb-6">
          <QRCodeSVG
            value={joinUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Session Code Highlight */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Session Code
          </div>
          <div className="font-mono text-2xl font-black text-blue-400 tracking-widest">
            {sessionCode}
          </div>
        </div>

        {/* Link / URL Box */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 text-xs text-slate-300">
          <div className="flex-1 truncate font-mono text-left px-1">
            {joinUrl}
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Network Hint */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local network: <strong className="text-slate-300">{serverInfo.ip}</strong></span>
        </div>
      </div>
    </div>
  );
}
