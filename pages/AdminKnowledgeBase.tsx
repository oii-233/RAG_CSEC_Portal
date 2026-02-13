
import React, { useState, useRef, useEffect } from 'react';
import { KnowledgeItem } from '../types';
import { Icons, COLORS } from '../constants';
import { chatService } from '../services/chatService';

const AdminKnowledgeBase: React.FC = () => {
  const [isRebuilding, setIsRebuilding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);
    const result = await chatService.getDocuments();
    if (result.success && result.data) {
      const mappedDocs: KnowledgeItem[] = result.data.documents.map((doc: any) => ({
        id: doc._id,
        title: doc.title,
        category: doc.category.toUpperCase() as any,
        sourceType: doc.title.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC',
        lastUpdated: doc.updatedAt.split('T')[0],
        status: 'EMBEDDED'
      }));
      setKnowledge(mappedDocs);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleRebuild = () => {
    setIsRebuilding(true);
    fetchDocuments().then(() => {
      setIsRebuilding(false);
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsLoading(true);
      const result = await chatService.uploadFile(file, 'safety');
      if (result.success) {
        await fetchDocuments();
      } else {
        alert(result.message || "Failed to upload document");
      }
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this document from the knowledge base?")) {
      const result = await chatService.deleteDocument(id);
      if (result.success) {
        setKnowledge(knowledge.filter(k => k.id !== id));
      } else {
        alert(result.message || "Failed to delete document");
      }
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 px-4 md:px-0">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#0F2A3D]">Knowledge Base Management</h2>
          <p className="text-sm text-gray-500">Maintain the ASTU Security & Policy RAG dataset.</p>
        </div>
        <button
          onClick={handleRebuild}
          disabled={isRebuilding}
          className="w-full sm:w-auto bg-[#17A2B8] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all text-sm"
        >
          {isRebuilding ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Icons.Book />
          )}
          {isRebuilding ? 'Synchronizing...' : 'Rebuild Index'}
        </button>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={handleUploadClick}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-4 hover:border-[#17A2B8] transition-all border-dashed border-2 group active:scale-95"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#17A2B8] transition-colors">
            <Icons.Plus />
          </div>
          <div>
            <div className="font-bold text-[#0F2A3D] text-sm md:text-base">Upload Policy File</div>
            <div className="text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-widest">Add Context</div>
          </div>
        </button>
        <button
          onClick={() => alert("Simulation: AI Sandbox Environment starting...")}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-12 h-12 bg-[#17A2B8]/10 text-[#17A2B8] rounded-full flex items-center justify-center">
            <Icons.Search />
          </div>
          <div>
            <div className="font-bold text-[#0F2A3D] text-sm md:text-base">Sandbox Tester</div>
            <div className="text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-widest">Verify Accuracy</div>
          </div>
        </button>
        <div className="bg-[#0F2A3D] p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center space-y-4 text-white sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <Icons.Shield />
          </div>
          <div>
            <div className="font-bold text-sm md:text-base">System Status</div>
            <div className="text-[10px] md:text-xs opacity-70 uppercase tracking-widest">Engine: Operational</div>
          </div>
        </div>
      </div>

      {/* Knowledge Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/10">
          <h3 className="font-bold text-[#0F2A3D] text-sm md:text-base uppercase tracking-tight">Dataset Inventory</h3>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{knowledge.length} Documents</span>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {knowledge.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-[#0F2A3D] line-clamp-1">{item.title}</div>
                    <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.sourceType} • Updated {item.lastUpdated}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] md:text-[10px] font-black text-[#17A2B8] bg-[#17A2B8]/5 px-2 py-1 rounded border border-[#17A2B8]/10 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === 'EMBEDDED' ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Ready
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-yellow-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                        Syncing
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {knowledge.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-300 font-bold uppercase tracking-widest text-xs italic">
                    No documents indexed in knowledge base
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminKnowledgeBase;
