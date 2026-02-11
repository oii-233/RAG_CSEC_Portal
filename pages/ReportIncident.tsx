
import React, { useState } from 'react';
import { Icons, COLORS } from '../constants';
import { ReportType } from '../types';

interface ReportIncidentProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ReportIncident: React.FC<ReportIncidentProps> = ({ onSubmit, onCancel }) => {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !location || !description) return;
    onSubmit({
      type: ReportType.SECURITY,
      category,
      location,
      description
    });
  };

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-[#C62828] p-6 text-white flex items-center gap-4">
          <div className="bg-white/20 p-2 rounded-lg"><Icons.Shield /></div>
          <div>
            <h2 className="text-xl font-bold">Report Security Incident</h2>
            <p className="text-sm opacity-80 font-medium">Verified by ASTU Campus Security Office</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Incident Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#17A2B8] outline-none transition-all appearance-none bg-gray-50"
                required
              >
                <option value="">Select Category...</option>
                <option value="Theft / Lost Property">Theft / Lost Property</option>
                <option value="Harassment">Harassment</option>
                <option value="Suspicious Activity">Suspicious Activity</option>
                <option value="Medical Emergency">Medical Emergency</option>
                <option value="Fire Incident">Fire Incident</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Campus Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Block A, Library 2nd Floor, Main Cafeteria"
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#17A2B8] outline-none transition-all bg-gray-50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Description of Incident</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Provide as much detail as possible to help the security team respond..."
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#17A2B8] outline-none transition-all bg-gray-50"
                required
              />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3 text-xs text-yellow-800">
            <Icons.Lock />
            <p>Your identity will be protected. All reports are handled according to ASTU's strict privacy and security protocols.</p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#17A2B8] text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIncident;
