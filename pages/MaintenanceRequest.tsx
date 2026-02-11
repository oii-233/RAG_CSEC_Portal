
import React, { useState } from 'react';
import { Icons, COLORS } from '../constants';
import { ReportType } from '../types';

interface MaintenanceRequestProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const MaintenanceRequest: React.FC<MaintenanceRequestProps> = ({ onSubmit, onCancel }) => {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !location || !description) return;
    onSubmit({
      type: ReportType.MAINTENANCE,
      category,
      location,
      description
    });
  };

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-[#17A2B8] p-6 text-white flex items-center gap-4">
          <div className="bg-white/20 p-2 rounded-lg"><Icons.Wrench /></div>
          <div>
            <h2 className="text-xl font-bold">Submit Maintenance Request</h2>
            <p className="text-sm opacity-80 font-medium">ASTU Facilities & Maintenance Management</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Issue Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#17A2B8] outline-none transition-all appearance-none bg-gray-50"
                required
              >
                <option value="">Select Issue Type...</option>
                <option value="Plumbing / Water Leak">Plumbing / Water Leak</option>
                <option value="Electrical / Lighting">Electrical / Lighting</option>
                <option value="Furniture Repair">Furniture Repair</option>
                <option value="Janitorial / Cleaning">Janitorial / Cleaning</option>
                <option value="Structural Damage">Structural Damage</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Room / Facility Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Dorm Block 5 Room 102, Science Hall Lab 4"
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#17A2B8] outline-none transition-all bg-gray-50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Details of Problem</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the issue. For plumbing/electrical, please mention if it is urgent..."
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#17A2B8] outline-none transition-all bg-gray-50"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-xs text-blue-800">
            <Icons.Alert />
            <p>Maintenance staff aim to respond within 24-48 hours for non-urgent requests. For severe leaks or power outages, notify your block representative.</p>
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
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceRequest;
