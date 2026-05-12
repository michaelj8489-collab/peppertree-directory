"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const fetchFiles = async () => {
    const { data } = await supabase.storage.from("peppertree-files").list("", {
      sortBy: { column: "name", order: "asc" },
    });
    if (data) setFiles(data);
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { error } = await supabase.storage.from("peppertree-files").upload(file.name, file);
    if (error) { alert("Upload failed: " + error.message); } else { fetchFiles(); }
    setUploading(false);
  };

  const handleView = async (fileName) => {
    const { data } = await supabase.storage.from("peppertree-files").createSignedUrl(fileName, 60); 
    if (data) window.open(data.signedUrl, "_blank");
  };

  const handleDownload = async (fileName) => {
    const { data } = await supabase.storage.from("peppertree-files").download(fileName);
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

  const handleDelete = async (fileName) => {
    if (!window.confirm(`Delete ${fileName}?`)) return;
    const { error } = await supabase.storage.from("peppertree-files").remove([fileName]);
    if (!error) fetchFiles();
  };

  if (loading) return <div className="min-h-screen bg-[#fdfaf0] flex justify-center items-center font-cinzel">Loading...</div>;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col items-center p-4 md:p-10"
      style={{ backgroundImage: "url('/ssi-pier.jpg')" }}
    >
      {/* Main Content Card - Matches the Login Card Style */}
      <div className="max-w-4xl w-full bg-[#fdfaf0] rounded-2xl shadow-2xl border border-stone-300 overflow-hidden mb-10 transition-all duration-700">
        
        {/* Optional: Branding Header inside the card */}
        <div className="w-full bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center text-white gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-cinzel tracking-widest">PEPPERTREE</h1>
            <p className="text-slate-400 font-cinzel text-xs tracking-[0.3em]">CROSSING DIRECTORY</p>
          </div>
          <button 
            onClick={() => {supabase.auth.signOut(); router.push("/");}} 
            className="bg-slate-600 hover:bg-slate-500 px-6 py-2 rounded font-cinzel text-xs tracking-widest transition shadow-md"
          >
            Log Out
          </button>
        </div>

        {isAdmin && (
          <div className="p-6 bg-stone-100/50 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-cinzel text-slate-700 font-bold tracking-tight">ADMINISTRATOR CONTROLS</span>
            <label className="bg-blue-700 hover:bg-blue-800 text-white font-cinzel font-bold py-3 px-8 rounded-lg shadow-lg cursor-pointer transition-all text-center w-full sm:w-auto">
              {uploading ? "Uploading..." : "Upload New File"}
              <input type="file" accept=".pdf, .jpg, .jpeg, .png" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        )}

        <div className="p-6 md:p-10">
          <h2 className="text-xl font-cinzel font-bold text-slate-800 mb-8 border-b border-stone-300 pb-3 tracking-widest">
            COMMUNITY DOCUMENTS
          </h2>
          
          <div className="space-y-4">
            {files.length === 0 ? (
              <p className="text-stone-500 italic text-center py-10 font-serif">The directory is currently empty.</p>
            ) : (
              files.map((file) => (
                file.name !== ".emptyFolderPlaceholder" && (
                  <div key={file.name} className="flex flex-col md:flex-row justify-between items-center p-5 bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-md transition-shadow gap-4">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                      <div className="bg-stone-100 p-2 rounded">
                        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <span className="text-lg text-slate-800 font-medium truncate max-w-[200px] md:max-w-xs">{file.name}</span>
                    </div>

                    <div className="flex w-full md:w-auto gap-2">
                      <button onClick={() => handleView(file.name)} className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-cinzel text-xs tracking-widest transition shadow-sm">View</button>
                      <button onClick={() => handleDownload(file.name)} className="flex-1 md:flex-none bg-stone-200 hover:bg-stone-300 text-slate-800 px-5 py-2 rounded-lg font-cinzel text-xs tracking-widest transition">Save</button>
                      {isAdmin && <button onClick={() => handleDelete(file.name)} className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-lg font-cinzel text-xs tracking-widest transition">Delete</button>}
                    </div>
                  </div>
                )
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
        .font-cinzel {{ font-family: 'Cinzel', serif; }}
      `}</style>
    </div>
  );
}