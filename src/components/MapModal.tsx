import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation } from 'lucide-react';

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  query: string;
  subtitle?: string;
}

export function MapModal({ open, onClose, query, subtitle }: MapModalProps) {
  const encoded = encodeURIComponent(`${query} ${subtitle ?? ''}`);
  const src = `https://www.openstreetmap.org/export/embed.html?marker=${encodeURIComponent(query)}`;
  const directions = `https://www.openstreetmap.org/search?query=${encoded}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-midnight-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden mx-0 sm:mx-4"
          >
            <div className="flex items-start gap-3 p-4 border-b border-sand-100">
              <div className="h-10 w-10 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-sky-600" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-midnight-900 truncate">{query}</p>
                {subtitle && <p className="text-xs text-midnight-400 mt-0.5 truncate">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg hover:bg-sand-100 flex items-center justify-center shrink-0 transition-colors"
              >
                <X size={18} className="text-midnight-400" strokeWidth={2.2} />
              </button>
            </div>

            <div className="relative h-64 sm:h-80 bg-sand-100">
              <iframe
                title={`Map of ${query}`}
                src={src}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
              />
            </div>

            <div className="p-4 flex gap-3">
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700 transition-colors"
              >
                <Navigation size={16} strokeWidth={2.4} />
                Get Directions
              </a>
              <button
                onClick={onClose}
                className="rounded-lg border border-sand-200 px-4 py-2.5 text-sm font-bold text-midnight-600 hover:bg-sand-50 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
