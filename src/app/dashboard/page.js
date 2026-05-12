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

  if (loading) return <div className="min-h-screen bg-[#fdfaf0] flex justify-center items-center font-cinzel text-slate-800">Loading Directory...</div>;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col items-center p-4 md:p-10 font-cinzel"
      style={{ backgroundImage: "url('/ssi-pier.jpg')" }}
    >
      {/* Main Content Card: Matches the Login Card exactly */}
      <div className="max-w-4xl w-full bg-[#fdfaf0] rounded-2xl shadow-2xl border border-stone-300 overflow-hidden mb-10">
        
        {/* Brand Header Image (Matches Login Page) */}
        <div className="w-full relative">
          <img 
            src="/peppertree-logo.jpg" 
            alt="Peppertree Crossing" 
            className="w-full h-auto object-cover border-b border-stone-200"
          />
          {/* Logout Button: Placed discreetly on top of the logo or just below it */}
          <button 
            onClick={() => {supabase.auth.signOut(); router.push("/");}} 
            className="absolute top-4 right-4 bg-slate-800/80 hover:bg-slate-900 text-white px-4 py-2 rounded text-[10px] tracking-[0.2em] transition backdrop-blur-sm uppercase font-bold"
          >
            Log Out
          </button>
        </div>

        <div className="p-6 md:p-10">
          {isAdmin && (
            <div className="mb-10 p-6 bg-white/50 border border-stone-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-bold text-slate-700 tracking-widest text-sm">ADMIN CONTROLS</span>
              <label className="bg-slate-800 hover:bg-slate-900 text-white py-3 px-8 rounded shadow cursor-pointer transition text-center w-full sm:w-auto text-xs font-bold tracking-widest">
                {uploading ? "UPLOADING..." : "UPLOAD NEW FILE"}
                <input type="file" accept=".pdf, .jpg, .jpeg, .png" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
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
                file.name !== ".emptyFolderPlaceholder" && (
                  <div key={file.name} className="flex flex-col md:flex-row justify-between items-center p-5 bg-white border border-stone-100 rounded-xl shadow-sm hover:shadow-md transition-shadow gap-4">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                      <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <span className="text-base text-slate-800 font-bold tracking-tight truncate max-w-[200px] md:max-w-xs">{file.name}</span>
                    </div>

                    <div className="flex w-full md:w-auto gap-2">
                      <button onClick={() => handleView(file.name)} className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-800 text-white px-5 py-2 rounded font-bold text-[10px] tracking-widest transition">VIEW</button>
                      <button onClick={() => handleDownload(file.name)} className="flex-1 md:flex-none bg-stone-200 hover:bg-stone-300 text-slate-800 px-5 py-2 rounded font-bold text-[10px] tracking-widest transition">SAVE</button>
                      {isAdmin && <button onClick={() => handleDelete(file.name)} className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded font-bold text-[10px] tracking-widest transition">DELETE</button>}
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
        
        .font-cinzel {
          font-family: 'Cinzel', serif !important;
        }
        
        /* This ensures ALL text inside the dashboard uses the font */
        * {
          font-family: 'Cinzel', serif;
        }
      `}</style>
    </div>
  );
}