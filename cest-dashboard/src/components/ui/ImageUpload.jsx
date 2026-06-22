import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Camera, Trash2, Star } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const ImageUpload = ({ 
  images = [], 
  onUpload, 
  onDelete, 
  onSetPrimary, 
  maxImages = 5, 
  darkMode = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name }
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          await onUpload(file);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const canUploadMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
            dragOver 
              ? 'border-blue-500 bg-blue-500/10' 
              : darkMode 
                ? 'border-gray-600 hover:border-gray-500' 
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {uploading ? (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-6 h-6" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
              )}
            </div>
            
            <div>
              <p className="font-semibold" style={{ color: darkMode ? '#f3f4f6' : '#1f2937' }}>
                {uploading ? 'Uploading...' : 'Drop images here or click to browse'}
              </p>
              <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                PNG, JPG, GIF up to 10MB ({images.length}/{maxImages} images)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className="relative group rounded-xl overflow-hidden aspect-square"
              style={{
                background: darkMode ? '#374151' : '#f3f4f6'
              }}
            >
              {/* Image */}
              <img
                src={image.url || image.file_path}
                alt={image.alt_text || `Image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              
              {/* Fallback */}
              <div 
                className="w-full h-full hidden items-center justify-center"
                style={{ background: darkMode ? '#4b5563' : '#e5e7eb' }}
              >
                <ImageIcon className="w-8 h-8" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }} />
              </div>

              {/* Primary Badge */}
              {image.is_primary && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Primary
                </div>
              )}

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                {!image.is_primary && onSetPrimary && (
                  <button
                    onClick={() => onSetPrimary(image.id)}
                    className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
                    title="Set as primary image"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={() => setDeleteConfirm({ 
                      id: image.id, 
                      name: image.file_name || `Image ${index + 1}` 
                    })}
                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                    title="Delete image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-xs font-medium truncate">
                  {image.file_name || `Image ${index + 1}`}
                </p>
                {image.file_size && (
                  <p className="text-white/70 text-xs">
                    {(image.file_size / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Images State */}
      {images.length === 0 && !canUploadMore && (
        <div className="text-center py-8">
          <Camera className="w-12 h-12 mx-auto mb-3" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }} />
          <p className="font-medium" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            No images uploaded yet
          </p>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => onDelete(deleteConfirm.id)}
        title="Delete Image?"
        message="This will permanently remove this image. This action cannot be undone."
        itemName={deleteConfirm?.name}
        confirmText="Delete Image"
        darkMode={darkMode}
      />
    </div>
  );
};

export default ImageUpload;