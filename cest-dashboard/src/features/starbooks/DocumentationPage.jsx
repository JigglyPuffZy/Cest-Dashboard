import { useState, useEffect, useMemo } from "react";
import { MapPin, Image as ImageIcon, Calendar, X, ZoomIn, Download, Filter, Search, RefreshCw } from "lucide-react";
import { db } from "../../shared/services/supabaseClient";
import { Modal, ModalPanel } from "../../components/ui/Modal";

export const DocumentationPage = ({ darkMode, readOnly = false }) => {
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [documentationData, setDocumentationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show 12 images per page

  // Load documentation from database (synced with inventory)
  useEffect(() => {
    loadDocumentation();
  }, []);

  const loadDocumentation = async () => {
    try {
      setLoading(true);
      const data = await db.getStarbooksDocumentation();
      
      // Transform data for display
      const transformed = data.flatMap(unit => {
        // Parse images if it's a string
        const images = typeof unit.images === 'string' ? JSON.parse(unit.images) : unit.images;
        
        // If unit has images, create entries for each image
        if (images && images.length > 0) {
          return images.map(img => ({
            id: `${unit.id}-${img.id}`,
            unitId: unit.id,
            city: unit.municipality,
            location: unit.location,
            image: img.image_url,
            date: img.uploaded_at || unit.installation_date || unit.created_at,
            description: img.caption || unit.documentation_notes || `${unit.category} at ${unit.location}`,
            category: img.category || unit.category || 'General',
            unitCode: unit.unit_code,
            province: unit.province,
            status: unit.status
          }));
        }
        
        // If no images but has primary_image_url, create one entry
        if (unit.primary_image_url) {
          return [{
            id: `${unit.id}-primary`,
            unitId: unit.id,
            city: unit.municipality,
            location: unit.location,
            image: unit.primary_image_url,
            date: unit.installation_date || unit.created_at,
            description: unit.documentation_notes || `${unit.category} at ${unit.location}`,
            category: unit.category || 'Installation',
            unitCode: unit.unit_code,
            province: unit.province,
            status: unit.status
          }];
        }
        
        // No images at all - skip this unit in documentation
        return [];
      });
      
      setDocumentationData(transformed);
      console.log('Documentation loaded:', transformed.length, 'images from', data.length, 'units');
    } catch (error) {
      console.error('Error loading documentation:', error);
      setDocumentationData([]);
    } finally {
      setLoading(false);
    }
  };

  const cities = ["all", ...new Set(documentationData.map(item => item.city))];

  const filteredData = documentationData.filter(item => {
    const matchesCity = selectedCity === "all" || item.city === selectedCity;
    const matchesSearch = item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity]);

  // Memoized theme colors - prevents recalculation on every render
  const theme = useMemo(() => ({
    cardBg: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    borderColor: darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 0.8)',
    textPrimary: darkMode ? '#f8fafc' : '#0f172a',
    textSecondary: darkMode ? '#94a3b8' : '#475569',
    hoverBg: darkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(241, 245, 249, 0.9)',
    inputBg: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(248, 250, 252, 0.98)',
    sectionBg: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(241, 245, 249, 0.95)',
  }), [darkMode]);

  // Stats
  const stats = useMemo(() => ({
    total: documentationData.length,
    cities: cities.length - 1,
    filtered: filteredData.length,
  }), [documentationData, cities, filteredData]);

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6" style={{ transition: 'all 0.3s ease' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: theme.textPrimary, transition: 'color 0.3s ease' }}>
            Documentation Gallery
          </h1>
          <p className="text-sm" style={{ color: theme.textSecondary, transition: 'color 0.3s ease' }}>
            Visual documentation of STARBOOKS installations across Region 2
          </p>
        </div>
        <button
          onClick={loadDocumentation}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl transition-all hover:scale-105 duration-300" style={{
          background: theme.cardBg,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
            : '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
              <ImageIcon className="w-6 h-6" style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{stats.total}</div>
              <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>Total Images</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl transition-all hover:scale-105 duration-300" style={{
          background: theme.cardBg,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
            : '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <MapPin className="w-6 h-6" style={{ color: '#22c55e' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{stats.cities}</div>
              <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>Cities</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl transition-all hover:scale-105 duration-300" style={{
          background: theme.cardBg,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
            : '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <Filter className="w-6 h-6" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{stats.filtered}</div>
              <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>Filtered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-5 rounded-xl" style={{
        background: theme.cardBg,
        border: `1px solid ${theme.borderColor}`,
        boxShadow: darkMode 
          ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
          : '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
      }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.textSecondary }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location or description..."
              className="w-full pl-12 pr-4 py-3 rounded-lg outline-none transition-all"
              style={{
                background: theme.inputBg,
                color: theme.textPrimary,
                border: `1px solid ${theme.borderColor}`,
                boxShadow: darkMode 
                  ? 'none' 
                  : '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-4 py-3 rounded-lg outline-none cursor-pointer"
            style={{
              background: theme.inputBg,
              color: theme.textPrimary,
              border: `1px solid ${theme.borderColor}`,
              minWidth: '180px',
              boxShadow: darkMode 
                ? 'none' 
                : '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <option value="all">All Cities</option>
            {cities.filter(c => c !== "all").map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 text-sm" style={{ color: theme.textSecondary }}>
          Showing <span className="font-bold" style={{ color: theme.textPrimary }}>{filteredData.length}</span> of <span className="font-bold" style={{ color: theme.textPrimary }}>{documentationData.length}</span> images
        </div>
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p style={{ color: theme.textSecondary }}>Loading documentation...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-20 rounded-xl" style={{
          background: theme.cardBg,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: darkMode 
            ? 'none' 
            : '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <ImageIcon className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textSecondary }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>No images found</h3>
          <p style={{ color: theme.textSecondary }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedData.map((item) => (
              <div
                key={item.id}
                className="rounded-xl overflow-hidden transition-all hover:scale-[1.02] cursor-pointer"
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.borderColor}`,
                  boxShadow: darkMode 
                    ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                    : '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
                }}
                onClick={() => setSelectedImage(item)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.description}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ 
                        background: '#3b82f6', 
                        color: '#ffffff'
                      }}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="absolute bottom-3 right-3">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/30">
                      <Calendar className="w-3 h-3 text-white" />
                      <span className="text-xs font-semibold text-white">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" style={{ color: '#3b82f6' }} />
                    <h3 className="text-base font-bold truncate" style={{ color: theme.textPrimary }}>
                      {item.city}
                    </h3>
                  </div>
                  <p className="text-sm font-semibold mb-1 truncate" style={{ color: theme.textPrimary }}>
                    {item.location}
                  </p>
                  <p className="text-xs line-clamp-2" style={{ color: theme.textSecondary }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-5 rounded-xl" style={{
              background: theme.cardBg,
              border: `1px solid ${theme.borderColor}`,
              boxShadow: darkMode 
                ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                : '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <div className="text-sm" style={{ color: theme.textSecondary }}>
                Showing <span className="font-bold" style={{ color: theme.textPrimary }}>{startIndex + 1}</span> to <span className="font-bold" style={{ color: theme.textPrimary }}>{Math.min(endIndex, filteredData.length)}</span> of <span className="font-bold" style={{ color: theme.textPrimary }}>{filteredData.length}</span> images
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: currentPage === 1 ? theme.inputBg : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: currentPage === 1 ? theme.textSecondary : '#ffffff'
                  }}
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first, last, current, and adjacent pages
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className="w-10 h-10 rounded-lg font-semibold transition-all hover:scale-105"
                          style={{
                            background: page === currentPage 
                              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                              : theme.inputBg,
                            color: page === currentPage ? '#ffffff' : theme.textPrimary
                          }}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} style={{ color: theme.textSecondary }}>...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: currentPage === totalPages ? theme.inputBg : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: currentPage === totalPages ? theme.textSecondary : '#ffffff'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <Modal onClose={() => setSelectedImage(null)} zIndex={50}>
          <ModalPanel maxWidth="max-w-4xl" className="rounded-2xl overflow-y-auto">
          <div
            style={{
              background: theme.cardBg,
              boxShadow: darkMode 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              border: `1px solid ${theme.borderColor}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 p-6 border-b flex items-center justify-between" style={{ 
              background: theme.cardBg,
              borderColor: theme.borderColor,
              boxShadow: darkMode 
                ? 'none' 
                : '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                  <MapPin className="w-6 h-6" style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
                    {selectedImage.city} - {selectedImage.location}
                  </h2>
                  <p className="text-sm flex items-center gap-2" style={{ color: theme.textSecondary }}>
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedImage.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2.5 rounded-xl transition-all hover:scale-110"
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444'
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image */}
            <div className="relative">
              <img
                src={selectedImage.image}
                alt={selectedImage.description}
                className="w-full h-auto max-h-[60vh] object-contain"
                style={{ background: theme.sectionBg }}
              />
            </div>

            {/* Footer */}
            <div className="p-6 border-t" style={{ borderColor: theme.borderColor }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: '#3b82f6',
                        color: '#ffffff'
                      }}
                    >
                      {selectedImage.category}
                    </span>
                    {selectedImage.unitCode && (
                      <span className="text-xs font-mono" style={{ color: theme.textSecondary }}>
                        {selectedImage.unitCode}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: theme.textSecondary }}>
                    Description
                  </p>
                  <p className="text-base" style={{ color: theme.textPrimary }}>
                    {selectedImage.description}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedImage.image;
                    link.download = `${selectedImage.unitCode || 'image'}.jpg`;
                    link.click();
                  }}
                  className="px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
          </ModalPanel>
        </Modal>
      )}
    </div>
  );
};
