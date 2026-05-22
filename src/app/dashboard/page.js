// @ts-nocheck.
/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // NEW STATE: Batch Upload Tracking
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [category, setCategory] = useState("");

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      if (session.user.email === "vtbigdog@gmail.com") { setIsAdmin(true); }
      fetchFiles();
    };
    checkUser();
  }, [router]);

  // UPDATED: Now fetches from our database table to organize by category
  const fetchFiles = async () => {
    const { data, error } = await supabase
      .from("client_files")
      .select("*")
      .order("file_type", { ascending: true })
      .order("name", { ascending: true });
      
    if (data) setFiles(data);
    setLoading(false);
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleBatchUpload = async () => {
    if (selectedFiles.length === 0 || !category) {
      alert("Please select files and enter a document category.");
      return;
    }

    setUploading(true);
    let successCount = 0;

    for (const file of selectedFiles) {
      // 1. Upload to storage bucket inside a category folder
      const { error: storageError } = await supabase.storage
        .from("peppertree-files")
        .upload(`${category}/${file.name}`, file, { upsert: true });

      if (storageError) {
        console.error("Upload failed for", file.name, storageError);
        continue;
      }

      // 2. Save metadata to our new database table
      const { error: dbError } = await supabase
        .from("client_files")
        .insert([
          {
            name: file.name,
            storage_path: `${category}/${file.name}`,
            file_type: category
          }
        ]);

      if (!dbError) successCount++;
    }

    alert(`Successfully uploaded ${successCount} files!`);
    setSelectedFiles([]); 
    setCategory(""); 
    setUploading(false);
    fetchFiles(); 
  };

  const handleView = async (storagePath) => {
    const { data } = await supabase.storage.from("peppertree-files").createSignedUrl(storagePath, 60); 
    if (data) window.open(data.signedUrl, "_blank");
  };

  const handleDownload = async (storagePath, fileName) => {
    const { data } = await supabase.storage.from("peppertree-files").download(storagePath);
    if (data) {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const handleDelete = async (id, storagePath) => {
    if (!window.confirm(`Delete this file?`)) return;
    
    await supabase.storage.from("peppertree-files").remove([storagePath]);
    const { error } = await supabase.from("client_files").delete().match({ id });
    if (!error) fetchFiles();
  };

  if (loading) return <div className="min-h-screen bg-[#fdfaf0] flex justify-center items-center font-cinzel text-slate-800">Loading Directory...</div>;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col items-center p-4 md:p-10 font-cinzel"
      style={{ backgroundImage: "url('/ssi-pier.jpg')" }}
    >
      <div className="max-w-4xl w-full bg-[#fdfaf0] rounded-2xl shadow-2xl border border-stone-300 overflow-hidden mb-10">
        
        <div className="w-full relative">
          <img 
            src="/peppertree-logo.jpg" 
            alt="Peppertree Crossing" 
            className="w-full h-auto object-cover border-b border-stone-200"
          />
          <button 
            onClick={() => {supabase.auth.signOut(); router.push("/");}} 
            className="absolute top-4 right-4 bg-slate-800/80 hover:bg-slate-900 text-white px-4 py-2 rounded text-[10px] tracking-[0.2em] transition backdrop-blur-sm uppercase font-bold"
          >
            Log Out
          </button>
        </div>

        <div className="p-6 md:p-10">
          {isAdmin && (
            <div className="mb-10 p-6 bg-white/50 border border-stone-200 rounded-xl flex flex-col space-y-4">
              <span className="font-bold text-slate-700 tracking-widest text-sm text-center md:text-left">ADMIN BATCH UPLOAD</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-slate-600 tracking-wider">DOCUMENT CATEGORY</label>
                  <input 
                    type="text" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Invoices, Blueprints..." 
                    className="p-3 border border-stone-300 rounded text-sm focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                   <label className="text-xs font-bold text-slate-600 tracking-wider">SELECT FILES OR FOLDER</label>
                   <div className="flex space-x-2">
                     <label className="bg-stone-200 hover:bg-stone-300 text-slate-800 py-3 px-4 rounded shadow cursor-pointer transition text-xs font-bold tracking-widest flex-1 text-center">
                        FILES
                        <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                     </label>
                     <label className="bg-stone-200 hover:bg-stone-300 text-slate-800 py-3 px-4 rounded shadow cursor-pointer transition text-xs font-bold tracking-widest flex-1 text-center">
                        FOLDER
                        <input type="file" webkitdirectory="true" multiple className="hidden" onChange={handleFileSelect} />
                     </label>
                   </div>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <p className="text-xs text-slate-600 font-bold text-center md:text-left">{selectedFiles.length} files queued for upload.</p>
              )}

              <button 
                onClick={handleBatchUpload}
                disabled={uploading || selectedFiles.length === 0 || !category}
                className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white py-3 px-8 rounded shadow transition w-full text-xs font-bold tracking-widest mt-2"
              >
                {uploading ? "UPLOADING BATCH..." : "UPLOAD ALL FILES"}
              </button>
            </div>
          )}

          <h2 className="text-xl font-bold text-slate-800 mb-8 border-b-2 border-slate-200 pb-3 tracking-[0.2em] text-center md:text-left">
            COMMUNITY DOCUMENTS
          </h2>
          
          <div className="space-y-4">
            {files.length === 0 ? (
              <p className="text-stone-500 italic text-center py-10 font-serif">No documents available at this time.</p>
            ) : (
              files.map((file) => (
                <div key={file.id} className="flex flex-col md:flex-row justify-between items-center p-5 bg-white border border-stone-100 rounded-xl shadow-sm hover:shadow-md transition-shadow gap-4">
                  <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="bg-stone-50 p-2 rounded-lg border border-stone-100 flex flex-col items-center justify-center min-w-[80px]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">{file.file_type}</span>
                    </div>
                    <span className="text-base text-slate-800 font-bold tracking-tight truncate max-w-[200px] md:max-w-xs">{file.name}</span>
                  </div>

                  <div className="flex w-full md:w-auto gap-2">
                    <button onClick={() => handleView(file.storage_path)} className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-800 text-white px-5 py-2 rounded font-bold text-[10px] tracking-widest transition">VIEW</button>
                    <button onClick={() => handleDownload(file.storage_path, file.name)} className="flex-1 md:flex-none bg-stone-200 hover:bg-stone-300 text-slate-800 px-5 py-2 rounded font-bold text-[10px] tracking-widest transition">SAVE</button>
                    {isAdmin && <button onClick={() => handleDelete(file.id, file.storage_path)} className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded font-bold text-[10px] tracking-widest transition">DELETE</button>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
        
        .font-cinzel {
          font-family: 'Cinzel', serif !important;
        }
        
        * {
          font-family: 'Cinzel', serif;
        }
      `}</style>
    </div>
  );
}