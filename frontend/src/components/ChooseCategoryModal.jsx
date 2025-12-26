import { Dialog } from "@headlessui/react";
import { useState, useEffect, useRef, startTransition } from "react";

const CATEGORIES = [
  { key: "A", emoji: "🏍️", title: "Categoria A", subs: ["AM", "A1", "A2", "A"] },
  { key: "B", emoji: "🚗", title: "Categoria B", subs: ["B1", "B", "BE"] },
  { key: "C", emoji: "🚛", title: "Categoria C", subs: ["C1", "C", "CE"] },
  { key: "D", emoji: "🚌", title: "Categoria D", subs: ["D1", "D", "Tb", "Tv", "DE"] },
  { key: "Tr", emoji: "🚜", title: "Categoria Tr", subs: [] },
];

export default function ChooseCategoryModal({ open, onClose }) {
  const [selected, setSelected] = useState(null);
  const prevOpenRef = useRef(open);

  // Reset selection when modal opens (transitions from closed to open)
  // Using startTransition to schedule the update and avoid synchronous setState
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    
    // Only reset when modal opens (false -> true transition)
    if (!wasOpen && open) {
      startTransition(() => {
        setSelected(null);
      });
    }
  }, [open]);

  function handleContinue() {
    if (!selected) return;
    localStorage.setItem("userCategory", selected);
    setSelected(null); // Reset state before closing
    onClose?.();
  }

  // Prevent closing the dialog via overlay/Esc by ignoring onClose events
  return (
    <Dialog open={open} onClose={() => {}} className="fixed inset-0 z-60">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />

      <div className="flex min-h-full items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl rounded-xl bg-white/5 border border-white/6 backdrop-blur-md p-6 text-white shadow-2xl">
          <Dialog.Title className="text-lg font-semibold mb-2">Alege categoria principală</Dialog.Title>
          <Dialog.Description className="text-sm text-white/80 mb-6">Selectează o singură categorie. Subcategoriile sunt informative.</Dialog.Description>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelected(cat.key)}
                className={`w-full text-left p-4 rounded-lg border transition-shadow duration-150 flex flex-col gap-2 ${selected === cat.key ? "border-cyan-400 bg-white/6 shadow-[0_8px_30px_rgba(59,130,246,0.12)]" : "border-white/6 hover:bg-white/4"}`}
                aria-pressed={selected === cat.key}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{cat.emoji}</div>
                  <div>
                    <div className="font-semibold">{cat.title}</div>
                    {cat.subs.length > 0 && (
                      <div className="text-sm text-white/70 mt-1">{cat.subs.join(' · ')}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={handleContinue}
              disabled={!selected}
              className={`px-4 py-2 rounded-md font-semibold ${selected ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white" : "bg-white/6 text-white/60 cursor-not-allowed"}`}
            >
              Continuă
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
