import { useState } from "react";
import { DocumentationPage } from "./DocumentationPage";
import { StarbooksArchivePage } from "./StarbooksArchivePage";
import { StarbooksInventorySimple } from "./StarbooksInventorySimple";

export const StarbooksPage = ({ darkMode, activePage = "starbooks", readOnly = false }) => {
  const getPageTitle = () => {
    switch(activePage) {
      case "starbooks": return "Inventory Management";
      case "starbooks-locations": return "Locations";
      case "starbooks-users": return "Users Management";
      case "starbooks-reports": return "Reports & Analytics";
      case "starbooks-maintenance": return "Maintenance Center";
      case "starbooks-docs": return "Documentation";
      default: return "Inventory Management";
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      {activePage === "starbooks-docs" ? (
        <DocumentationPage darkMode={darkMode} readOnly={readOnly} />
      ) : activePage === "starbooks-archive" ? (
        <StarbooksArchivePage darkMode={darkMode} readOnly={readOnly} />
      ) : activePage === "starbooks" ? (
        <StarbooksInventorySimple darkMode={darkMode} readOnly={readOnly} />
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <div 
            className="text-center p-12 rounded-3xl backdrop-blur-xl shadow-2xl max-w-md animate-fade-in"
            style={{
              background: darkMode 
                ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)'
                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)',
              border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`
            }}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-glow">
              <span className="text-5xl">
                {activePage === "starbooks-locations" && "📍"}
                {activePage === "starbooks-users" && "👥"}
                {activePage === "starbooks-reports" && "📊"}
                {activePage === "starbooks-maintenance" && "🔧"}
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-3 gradient-text">
              {getPageTitle()}
            </h2>
            <p className="font-medium mb-4" style={{ color: darkMode ? '#94a3b8' : '#475569' }}>
              This section is coming soon
            </p>
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.3)' : '#d1fae5',
                color: darkMode ? '#10b981' : '#059669'
              }}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              In Development
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
