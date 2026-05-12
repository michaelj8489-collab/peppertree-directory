"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase"; // Go up two folders to find the bridge
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Check who is logged in when the page loads
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If they aren't logged in, kick them back to the login screen
        router.push("/");
        return;
      }

      // Check if this is the admin email
      if (session.user.email === "vtbigdog@gmail.com") {
        setIsAdmin(true);
      }

      // Grab the files!
      fetchFiles();
    };

    checkUser();
  }, [router]);

  // 2. The function to pull files from the bucket
  const fetchFiles = async () => {
    const { data, error } = await supabase
      .storage
      .from("peppertree-files")
      .list("", {
        sortBy: { column: "name", order: "asc" }, // Auto-sort A-Z
      });

    if (data) {
      setFiles(data);
    }
    setLoading(false);
  };

  // 3. The Admin Upload function
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    const { error } = await supabase
      .storage
      .from("peppertree-files")
      .upload(file.name, file);

    if (error) {
      alert("Upload failed: " + error.message);
    } else {
      fetchFiles(); // Refresh the list automatically
    }
    
    setUploading(false);
  };

  // 4. The Universal Download function
  const handleDownload = async (fileName) => {
    const { data, error } = await supabase
      .storage
      .from("peppertree-files")
      .download(fileName);

    if (error) {
      alert("Error downloading file.");
      return;
    }

    // This creates a temporary link in the browser to force the file to download
    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // 5. The Admin Delete function
  const handleDelete = async (fileName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${fileName}?`);
    if (!confirmDelete) return;

    const { error } = await supabase
      .storage
      .from("peppertree-files")
      .remove([fileName]);

    if (!error) {
      fetchFiles(); // Refresh the list
    }
  };

  // 6. The Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <div className="min-h-screen bg-stone-50 flex justify-center items-center text-2xl font-playfair text-stone-600">Loading directory...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-800 p-8 flex justify-between items-center text-white">
          <div>
            <h1 className="text-4xl font-luxurious tracking-wide">Peppertree Directory</h1>
            <p className="text-slate-300 mt-2 text-lg font-playfair italic">Community Document Portal</p>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-slate-600 hover:bg-slate-500 font-playfair tracking-wider text-white px-5 py-2 rounded shadow transition"
          >
            Log Out
          </button>
        </div>

        {/* Admin Control Panel (Only shows if isAdmin is true) */}
        {isAdmin && (
          <div className="bg-stone-100 p-6 border-b border-stone-200 flex items-center justify-between">
            <div className="text-slate-800 font-semibold text-lg font-playfair">Admin Controls:</div>
            <label className="bg-blue-700 hover:bg-blue-800 text-white font-playfair tracking-wider py-3 px-6 rounded shadow cursor-pointer transition">
              {uploading ? "Uploading..." : "Upload New File"}
              <input 
                type="file" 
                accept=".pdf, .jpg, .jpeg, .png" 
                className="hidden" 
                onChange={handleUpload} 
                disabled={uploading} 
                />
            </label>
          </div>
        )}

        {/* The File List */}
        <div className="p-8">
          <h2 className="text-2xl font-playfair font-semibold text-slate-700 mb-6 border-b pb-2">Available Documents</h2>
          
          {files.length === 0 ? (
            <p className="text-stone-500 text-lg font-playfair italic p-4 text-center bg-stone-50 rounded">
              No documents have been uploaded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {files.map((file) => (
                // We ignore the hidden placeholder file Supabase creates for empty folders
                file.name !== ".emptyFolderPlaceholder" && (
                  <div key={file.name} className="flex justify-between items-center p-5 bg-stone-50 border border-stone-200 rounded-lg hover:shadow-md transition">
                    
                    <div className="flex items-center space-x-4">
                      {/* A simple document icon */}
                      <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                      <span className="text-xl text-slate-800 font-medium">{file.name}</span>
                    </div>

                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleDownload(file.name)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-playfair font-semibold py-2 px-5 rounded transition"
                      >
                        Download
                      </button>
                      
                      {/* Delete Button (Only shows if isAdmin is true) */}
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(file.name)}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-playfair font-semibold py-2 px-4 rounded transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Bringing the fonts over to this page too! */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Luxurious+Roman&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        .font-luxurious { font-family: 'Luxurious Roman', serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
}