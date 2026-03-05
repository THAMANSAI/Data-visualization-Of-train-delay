import React, { useState } from 'react';
import { ChevronDown, Play, Pause, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FilterBarProps {
  trains: string[];
  zones: string[];
  selectedTrain: string;
  selectedZone: string;
  onTrainChange: (train: string) => void;
  onZoneChange: (zone: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  timeFilter: number;
  onTimeChange: (time: number) => void;
}

export const FilterBar = ({
  trains,
  zones,
  selectedTrain,
  selectedZone,
  onTrainChange,
  onZoneChange,
  isPlaying,
  onTogglePlay,
  timeFilter,
  onTimeChange
}: FilterBarProps) => {
  return (
    <div className="h-[56px] bg-white border border-[#E2E8F0] rounded-[12px] shadow-filter px-3 flex items-center gap-3 mb-6">
      <div className="flex items-center gap-2 pr-3 border-r border-[#E2E8F0] h-8">
        <span className="filter-label text-text-secondary">Filters</span>
      </div>

      <div className="flex items-center gap-3">
        <Dropdown 
          label="Train" 
          options={trains} 
          value={selectedTrain} 
          onChange={onTrainChange} 
        />
        <Dropdown 
          label="Zone" 
          options={zones} 
          value={selectedZone} 
          onChange={onZoneChange} 
        />
      </div>

      <div className="flex-1 flex items-center gap-6 pl-6 border-l border-[#E2E8F0] h-8">
        <button 
          onClick={onTogglePlay}
          className={`w-9 h-9 rounded-[8px] flex items-center justify-center transition-all duration-200 relative ${
            isPlaying 
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
              : 'bg-linear-to-br from-[#3B82F6] to-[#2563EB] text-white shadow-lg shadow-blue-500/20'
          }`}
        >
          {isPlaying ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Pause size={18} fill="currentColor" />
            </motion.div>
          ) : (
            <Play size={18} fill="currentColor" />
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="metadata-xs font-semibold uppercase tracking-wider">Timeline Playback</span>
            <span className="text-[13px] font-bold text-accent-cyan">{timeFilter}:00 Hours</span>
          </div>
          <div className="relative h-4 flex items-center">
            <div className="absolute w-full h-1 bg-[#E2E8F0] rounded-full" />
            <div 
              className="absolute h-1 bg-[#3B82F6] rounded-full" 
              style={{ width: `${(timeFilter / 24) * 100}%` }} 
            />
            <input 
              type="range" 
              min="0" 
              max="24" 
              value={timeFilter}
              onChange={(e) => onTimeChange(parseInt(e.target.value))}
              className="absolute w-full h-4 opacity-0 cursor-pointer z-10"
            />
            <motion.div 
              className="absolute w-4 h-4 bg-white border-2 border-[#3B82F6] rounded-full shadow-md pointer-events-none"
              style={{ left: `calc(${(timeFilter / 24) * 100}% - 8px)` }}
              layoutId="slider-thumb"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Dropdown = ({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 border border-[#E2E8F0] rounded-[8px] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-all duration-200 flex items-center gap-2 min-w-[120px]"
      >
        <span className="text-[13px] font-medium text-text-primary truncate">
          {value === 'All' ? `All ${label}s` : value}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronDown size={14} className="text-text-muted" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-full min-w-[160px] bg-white border border-[#E2E8F0] rounded-[12px] shadow-xl z-50 py-1 overflow-hidden origin-top"
          >
            <div className="max-h-[240px] overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-[13px] hover:bg-[#F8FAFC] transition-colors ${
                    value === option ? 'text-[#3B82F6] font-semibold bg-blue-50/50' : 'text-text-primary'
                  }`}
                >
                  {option === 'All' ? `All ${label}s` : option}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
