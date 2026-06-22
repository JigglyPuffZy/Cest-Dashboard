import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { Breadcrumb } from "../../components/layout/Breadcrumb";
import { fmt } from "../../shared/utils/helpers";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { COMP_COLORS } from "../../shared/constants";
import { getProvinceById, getMunicipalitiesByProvince } from "../../shared/data/regionII";
import { transformProjects } from "../../shared/utils/dataTransform";

export const CitiesPage = ({ projects, darkMode }) => {
  const navigate = useNavigate();
  const { provinceId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");

  // Transform projects data to handle Supabase structure
  const transformedProjects = transformProjects(projects);

  // Get province data from official structure
  const province = getProvinceById(provinceId);
  const provinceName = province ? province.name : provinceId;
  const officialMunicipalities = province ? getMunicipalitiesByProvince(provinceId) : [];

  const provinceProjects = transformedProjects.filter(
    (p) => p.province?.toLowerCase() === provinceName.toLowerCase()
  );

  // Get municipalities from projects (for backward compatibility)
  const projectMunicipalities = Array.from(new Set(provinceProjects.map((p) => p.municipality)))
    .filter(Boolean)
    .sort();

  // Combine official municipalities with project data
  const municipalities = officialMunicipalities.length > 0 
    ? officialMunicipalities.map(m => m.name)
    : projectMunicipalities;

  const cityData = municipalities
    .map((city) => {
      const cityProjects = provinceProjects.filter((p) => p.municipality === city);
      const totalBudget = cityProjects.reduce((sum, p) => sum + Number(p.amountFunded || 0), 0);
      const barangays = new Set(cityProjects.map((p) => p.community)).size;

      return {
        name: city,
        projectCount: cityProjects.length,
        totalBudget,
        barangays,
      };
    })
    .filter((c) => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  const chartData = cityData
    .filter((c) => c.totalBudget > 0)
    .sort((a, b) => b.totalBudget - a.totalBudget)
    .slice(0, 8)
    .map((c) => ({
      name: c.name.length > 12 ? c.name.substring(0, 10) + "..." : c.name,
      fullName: c.name,
      budget: c.totalBudget,
    }));

  const maxBudget = chartData.reduce((m, d) => Math.max(m, d.budget), 0);
  const fmtChart = (v) =>
    maxBudget >= 1_000_000 ? `₱${(v / 1_000_000).toFixed(1)}M` : `₱${(v / 1_000).toFixed(0)}k`;

  // Component distribution for this province
  const componentData = Object.keys(COMP_COLORS)
    .filter(key => key !== 'default') // Exclude default color
    .map((key) => {
      const count = provinceProjects.filter((p) => {
        // Handle transformed components array
        const components = p.components || [];
        return components.includes(key.toLowerCase());
      }).length;
      
      return {
        name: key.toUpperCase(),
        value: count,
        color: COMP_COLORS[key],
      };
    })
    .filter((d) => d.value > 0);

  const cardStyle = {
    background: darkMode ? "#0f172a" : "#ffffff",
    border: `1px solid ${darkMode ? "#1e293b" : "#e5e7eb"}`,
    boxShadow: darkMode ? "0 1px 3px rgba(0, 0, 0, 0.5)" : "0 1px 3px rgba(0, 0, 0, 0.05)",
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Region II Analytics", path: "/analytics" },
          { label: provinceName },
        ]}
        darkMode={darkMode}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
            {provinceName}
          </h1>
          <p className="text-sm" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
            Select a city or municipality to view barangay-level data
          </p>
        </div>

        <button
          onClick={() => navigate("/analytics")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: darkMode ? "#1e293b" : "#f8fafc",
            color: darkMode ? "#f8fafc" : "#0f172a",
            border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Provinces
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search cities/municipalities..."
          className="w-full px-4 py-2.5 rounded-lg text-sm font-medium outline-none transition-all duration-200"
          style={{
            background: darkMode ? "#1e293b" : "#f8fafc",
            color: darkMode ? "#f8fafc" : "#0f172a",
            border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
          }}
          onFocus={(e) => (e.target.style.borderColor = "#004A98")}
          onBlur={(e) => (e.target.style.borderColor = darkMode ? "#334155" : "#e2e8f0")}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Chart */}
        {chartData.length > 0 && (
          <div className="rounded-xl p-6" style={cardStyle}>
            <h3 className="text-lg font-semibold mb-1" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
              Budget by City/Municipality
            </h3>
            <p className="text-sm mb-6" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
              Top municipalities in {provinceName}
            </p>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: darkMode ? "#94a3b8" : "#64748b", fontWeight: 500 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tickLine={false}
                  axisLine={{ stroke: darkMode ? "#334155" : "#e5e7eb", strokeWidth: 1 }}
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: darkMode ? "#94a3b8" : "#64748b", fontWeight: 500 }}
                  tickFormatter={fmtChart}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            background: darkMode ? "#0f172a" : "#ffffff",
                            border: `1px solid ${darkMode ? "#1e293b" : "#e5e7eb"}`,
                            boxShadow: darkMode
                              ? "0 4px 12px rgba(0,0,0,0.5)"
                              : "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        >
                          <p
                            className="font-semibold text-xs mb-1"
                            style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
                          >
                            {payload[0].payload.fullName}
                          </p>
                          <p className="font-bold text-lg" style={{ color: "#004A98" }}>
                            {fmtChart(payload[0].value)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ fill: darkMode ? "rgba(148, 163, 184, 0.05)" : "rgba(226, 232, 240, 0.5)" }}
                />
                <Bar dataKey="budget" radius={[6, 6, 0, 0]} fill="#004A98" maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Component Distribution */}
        {componentData.length > 0 && (
          <div className="rounded-xl p-6" style={cardStyle}>
            <h3 className="text-lg font-semibold mb-1" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
              Component Distribution
            </h3>
            <p className="text-sm mb-6" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
              CEST 2.0 components in {provinceName}
            </p>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={componentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  dataKey="value"
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {componentData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                      stroke={darkMode ? "#0f172a" : "#ffffff"}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            background: darkMode ? "#0f172a" : "#ffffff",
                            border: `1px solid ${darkMode ? "#1e293b" : "#e5e7eb"}`,
                            boxShadow: darkMode
                              ? "0 4px 12px rgba(0,0,0,0.5)"
                              : "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        >
                          <p
                            className="font-semibold text-xs mb-1"
                            style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
                          >
                            {payload[0].name}
                          </p>
                          <p className="font-bold text-lg" style={{ color: payload[0].payload.color }}>
                            {payload[0].value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* City Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cityData.map((city) => (
          <button
            key={city.name}
            onClick={() => navigate(`/analytics/provinces/${provinceId}/cities/${encodeURIComponent(city.name)}`)}
            className="text-left rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] group"
            style={cardStyle}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg" style={{ background: "rgba(0, 74, 152, 0.1)" }}>
                <Building2 className="w-6 h-6" style={{ color: "#004A98" }} />
              </div>
              <ArrowRight
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                style={{ color: darkMode ? "#64748b" : "#94a3b8" }}
              />
            </div>

            <h3 className="text-lg font-semibold mb-2" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
              {city.name}
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                  Projects
                </span>
                <span className="text-sm font-semibold" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
                  {city.projectCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                  Barangays
                </span>
                <span className="text-sm font-semibold" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
                  {city.barangays}
                </span>
              </div>
              <div
                className="flex items-center justify-between pt-2 border-t"
                style={{ borderColor: darkMode ? "#1e293b" : "#e5e7eb" }}
              >
                <span className="text-sm font-medium" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                  Total Budget
                </span>
                <span className="text-lg font-bold" style={{ color: "#3b82f6" }}>
                  {fmt(city.totalBudget)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
