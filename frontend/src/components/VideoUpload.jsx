import { useState } from 'react';
import axios from 'axios';
import api from '../lib/axios';
import { UploadCloud, Loader2, CheckCircle } from 'lucide-react';

const VideoUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setSuccess(false);

    try {
      // Get signed signature from our backend
      const { data: signatureData } = await api.get('/upload/signature');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', signatureData.timestamp);
      formData.append('signature', signatureData.signature);
      formData.append('folder', signatureData.folder);

      // Upload directly to Cloudinary
      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/video/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        }
      );

      setSuccess(true);
      onUploadSuccess({
        url: uploadRes.data.secure_url,
        duration: Math.round(uploadRes.data.duration || 0)
      });
      setFile(null);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Video upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center bg-stone-50">
      {success ? (
        <div className="flex flex-col items-center text-green-600">
          <CheckCircle className="h-12 w-12 mb-2" />
          <span className="font-medium">Upload successful!</span>
        </div>
      ) : (
        <>
          <UploadCloud className="mx-auto h-12 w-12 text-stone-400 mb-4" />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            id="video-upload"
            disabled={uploading}
          />
          <label
            htmlFor="video-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 hover:bg-stone-50 mb-4"
          >
            Select Video File
          </label>
          {file && (
            <div className="text-sm text-stone-600 mb-4">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}
          
          {uploading && (
            <div className="w-full bg-stone-200 rounded-full h-2.5 mb-4">
              <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full flex justify-center items-center rounded-lg border border-transparent bg-amber-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-amber-700 disabled:opacity-70"
          >
            {uploading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
            {uploading ? `Uploading ${progress}%` : 'Upload to Cloudinary'}
          </button>
        </>
      )}
    </div>
  );
};

export default VideoUpload;
