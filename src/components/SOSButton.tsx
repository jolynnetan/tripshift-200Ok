import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, Phone, MapPin, Share2 } from 'lucide-react';

interface SOSButtonProps {
  destination: string;
}

export function SOSButton({ destination }: SOSButtonProps) {
  const [open, setOpen] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'Emergency — My Location',
      text: `I need help. I am currently in ${destination}. This is my travel SOS.`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      }
    } catch {
      // user cancelled or clipboard unavailable
    }
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 transition-colors"
      >
        <ShieldAlert size={18} strokeWidth={2.5} />
        SOS
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-midnight-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden mx-0 sm:mx-4"
            >
              <div className="flex items-center justify-between p-4 bg-red-600">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert size={20} className="text-white" strokeWidth={2.5} />
                  <span className="font-bold text-white text-base">Emergency SOS</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-lg hover:bg-red-500 flex items-center justify-center transition-colors"
                >
                  <X size={18} className="text-white" strokeWidth={2.2} />
                </button>
              </div>

              <div className="p-5">
                <p className="text-sm text-midnight-600 leading-relaxed mb-5">
                  Use this in an emergency. You can quickly call local emergency services or share your current location with your travel group.
                </p>

                <div className="space-y-3">
                  <a
                    href="tel:112"
                    className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50/50 p-4 hover:bg-red-50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-white" strokeWidth={2.4} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-midnight-900">Call Emergency (112)</p>
                      <p className="text-xs text-midnight-400 mt-0.5">International emergency number</p>
                    </div>
                  </a>

                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50/50 p-4 hover:bg-sky-50 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-sky-600 flex items-center justify-center shrink-0">
                      <Share2 size={18} className="text-white" strokeWidth={2.4} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-midnight-900">
                        {shared ? 'Location shared!' : 'Share My Location'}
                      </p>
                      <p className="text-xs text-midnight-400 mt-0.5">
                        {shared ? 'Sent to clipboard/contacts' : `Send "I'm in ${destination}" to your contacts`}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-3 rounded-lg border border-sand-200 bg-sand-50/50 p-4">
                    <div className="h-10 w-10 rounded-full bg-midnight-900 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-white" strokeWidth={2.4} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-midnight-900">Current Destination</p>
                      <p className="text-xs text-midnight-400 mt-0.5">{destination}</p>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-center text-xs text-midnight-400">
                  Always contact local authorities first in a real emergency.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
