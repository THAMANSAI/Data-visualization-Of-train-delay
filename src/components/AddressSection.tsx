import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

export const AddressSection = () => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-10 shadow-card mt-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/10 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
      
      <h3 className="text-2xl font-bold font-serif italic mb-8 relative z-10">Contact & Location</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
        <div className="flex items-start gap-5 group">
          <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors border border-white/5">
            <MapPin className="text-accent-cyan" size={28} />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">Headquarters</h4>
            <p className="text-slate-400 leading-relaxed text-sm">
              RailTrack Operations Center<br />
              123 Railway Colony, Chanakyapuri<br />
              New Delhi, Delhi 110021<br />
              India
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-5 group">
          <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors border border-white/5">
            <Phone className="text-accent-emerald" size={28} />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">24/7 Control Room</h4>
            <p className="text-slate-400 leading-relaxed text-sm">
              Emergency: <span className="text-white font-mono">139</span><br />
              Support: <span className="text-white font-mono">+91 11 2338 9999</span><br />
              Fax: <span className="text-white font-mono">+91 11 2338 1111</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-5 group">
          <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors border border-white/5">
            <Mail className="text-accent-violet" size={28} />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">Digital Correspondence</h4>
            <p className="text-slate-400 leading-relaxed text-sm">
              <a href="mailto:ops@railtrack.gov.in" className="hover:text-accent-cyan transition-colors">ops@railtrack.gov.in</a><br />
              <a href="mailto:grievance@railtrack.gov.in" className="hover:text-accent-cyan transition-colors">grievance@railtrack.gov.in</a><br />
              <a href="mailto:press@railtrack.gov.in" className="hover:text-accent-cyan transition-colors">press@railtrack.gov.in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
