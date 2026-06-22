import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, ArrowLeft, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Breadcrumb } from "../../components/layout/Breadcrumb";
import { ChartTooltip } from "../../components/ui/ChartTooltip";
import { fmt } from "../../shared/utils/helpers";
import { COMP_COLORS } from "../../shared/constants";
import { getProvinceById } from "../../shared/data/regionII";
import { transformProjects } from "../../shared/utils/dataTransform";

// ── Inline helpers ────────────────────────────────────────────────────

const getCompColor = (key) =>
  COMP_COLORS[key?.toLowerCase()] || COMP_COLORS.default;

// ── Main Component ─────────────────────────────────────────────────────────

export const BarangaysPage = ({ projects, darkMode }) => {
  const navigate = useNavigate();
  const { provinceId, cityName } = useParams();
  const [searchTerm, setSearchTerm] = useState("");

  // Transform projects data to handle Supabase structure
  const transformedProjects = transformProjects(projects);

  // Get province data from official structure
  const province = getProvinceById(provinceId);
  const provinceName = province ? province.name : provinceId;
  const decodedCityName = decodeURIComponent(cityName);

  const cityProjects = transformedProjects.filter(
    (p) => {
      return p.province?.toLowerCase() === provinceName.toLowerCase() &&
             p.municipality === decodedCityName;
    }
  );

  const barangays = Array.from(new Set(cityProjects.map((p) => p.community)))
    .filter(Boolean)
    .sort();

  const barangayData = barangays
    .map((barangay) => {
      const barangayProjects = cityProjects.filter(
        (p) => p.community === barangay
      );
      const totalBudget = barangayProjects.reduce(
        (sum, p) => sum + Number(p.amountFunded || 0),
        0
      );
      const ongoingProjects = barangayProjects.filter(
        (p) => p.status === "Ongoing"
      ).length;
      return {
        name: barangay,
        projectCount: barangayProjects.length,
        totalBudget,
        ongoingProjects,
        projects: barangayProjects,
      };
    })
    .filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const chartData = barangayData
    .filter((b) => b.totalBudget > 0)
    .sort((a, b) => b.totalBudget - a.totalBudget)
    .slice(0, 10)
    .map((b) => ({
      name: b.name.length > 15 ? b.name.substring(0, 13) + "…" : b.name,
      fullName: b.name,
      budget: b.totalBudget,
      projects: b.projectCount,
    }));

  const maxBudget = chartData.reduce((m, d) => Math.max(m, d.budget), 0);
  const fmtChart = (v) =>
    maxBudget >= 1_000_000
      ? `₱${(v / 1_000_000).toFixed(1)}M`
      : `₱${(v / 1_000).toFixed(0)}k`;

  const yearData = Array.from(new Set(cityProjects.map((p) => p.year)))
    .filter(Boolean)
    .sort()
    .map((year) => {
      const yp = cityProjects.filter((p) => p.year === year);
      return {
        year: String(year),
        budget: yp.reduce((sum, p) => sum + Number(p.amountFunded || 0), 0),
        projects: yp.length,
      };
    });

  // ── Styles ───────────────────────────────────────────────────────────────

  const card = {
    background: darkMode ? "#0f172a" : "#ffffff",
    border: `1px solid ${darkMode ? "#1e293b" : "#e5e7eb"}`,
    boxShadow: darkMode
      ? "0 1px 3px rgba(0,0,0,0.5)"
      : "0 1px 3px rgba(0,0,0,0.05)",
  };

  const label = { color: darkMode ? "#f8fafc" : "#0f172a" };
  const muted = { color: darkMode ? "#94a3b8" : "#64748b" };

  const getStatusColor = (status) => {
    if (status === "Ongoing")
      return darkMode
        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        : "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (status === "Liquidated")
      return darkMode
        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
        : "text-amber-700 bg-amber-50 border-amber-200";
    return darkMode
      ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
      : "text-blue-700 bg-blue-50 border-blue-200";
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Region II Analytics", path: "/analytics" },
          { label: provinceName, path: `/analytics/provinces/${provinceId}` },
          { label: decodedCityName },
        ]}
        darkMode={darkMode}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold mb-1 leading-snug" style={label}>
            {decodedCityName}
          </h1>
          <p className="text-sm" style={muted}>
            Barangay-level project analytics
          </p>
        </div>
        <button
          onClick={() => navigate(`/analytics/provinces/${provinceId}`)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shrink-0"
          style={{
            background: darkMode ? "#1e293b" : "#f8fafc",
            color: darkMode ? "#f8fafc" : "#0f172a",
            border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {provinceName}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Projects",
            value: cityProjects.length,
            icon: TrendingUp,
            color: "#004A98",
          },
          {
            label: "Barangays",
            value: barangays.length,
            icon: MapPin,
            color: "#3b82f6",
          },
          {
            label: "Total Budget",
            value: fmt(
              cityProjects.reduce((s, p) => s + Number(p.amountFunded || 0), 0)
            ),
            icon: TrendingUp,
            color: "#f59e0b",
          },
          {
            label: "Ongoing",
            value: cityProjects.filter((p) => p.status === "Ongoing").length,
            icon: TrendingUp,
            color: "#8b5cf6",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl p-5" style={card}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: `${stat.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={muted}>
                {stat.label}
              </p>
              <p className="text-2xl font-semibold" style={label}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="rounded-xl p-5" style={card}>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search barangays..."
          className="w-full px-4 py-2.5 rounded-lg text-sm font-medium outline-none transition-all duration-200"
          style={{
            background: darkMode ? "#1e293b" : "#f8fafc",
            color: darkMode ? "#f8fafc" : "#0f172a",
            border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
          }}
          onFocus={(e) => (e.target.style.borderColor = "#004A98")}
          onBlur={(e) =>
            (e.target.style.borderColor = darkMode ? "#334155" : "#e2e8f0")
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData.length > 0 && (
          <div className="rounded-xl p-6" style={card}>
            <h3 className="text-lg font-semibold mb-1" style={label}>
              Budget by Barangay
            </h3>
            <p className="text-sm mb-6" style={muted}>
              Top barangays in {decodedCityName}
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 60 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 9,
                    fill: darkMode ? "#94a3b8" : "#64748b",
                    fontWeight: 500,
                  }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tickLine={false}
                  axisLine={{
                    stroke: darkMode ? "#334155" : "#e5e7eb",
                    strokeWidth: 1,
                  }}
                  height={100}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: darkMode ? "#94a3b8" : "#64748b",
                    fontWeight: 500,
                  }}
                  tickFormatter={fmtChart}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <ChartTooltip
                        title={payload[0].payload.fullName}
                        value={fmtChart(payload[0].value)}
                        accentColor="#004A98"
                        subtitle={`${payload[0].payload.projects} projects`}
                      />
                    ) : null
                  }
                  cursor={{
                    fill: darkMode
                      ? "rgba(148,163,184,0.05)"
                      : "rgba(226,232,240,0.5)",
                  }}
                />
                <Bar
                  dataKey="budget"
                  radius={[6, 6, 0, 0]}
                  fill="#004A98"
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {yearData.length > 1 && (
          <div className="rounded-xl p-6" style={card}>
            <h3 className="text-lg font-semibold mb-1" style={label}>
              Budget Trend
            </h3>
            <p className="text-sm mb-6" style={muted}>
              Year-over-year budget allocation
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={yearData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <XAxis
                  dataKey="year"
                  tick={{
                    fontSize: 11,
                    fill: darkMode ? "#94a3b8" : "#64748b",
                    fontWeight: 500,
                  }}
                  tickLine={false}
                  axisLine={{
                    stroke: darkMode ? "#334155" : "#e5e7eb",
                    strokeWidth: 1,
                  }}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: darkMode ? "#94a3b8" : "#64748b",
                    fontWeight: 500,
                  }}
                  tickFormatter={fmtChart}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <ChartTooltip
                        title={`Year ${payload[0].payload.year}`}
                        value={fmtChart(payload[0].value)}
                        accentColor="#004A98"
                        subtitle={`${payload[0].payload.projects} projects`}
                      />
                    ) : null
                  }
                  cursor={{
                    stroke: darkMode ? "#475569" : "#cbd5e1",
                    strokeWidth: 1,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="#004A98"
                  strokeWidth={3}
                  dot={{ fill: "#004A98", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Barangay Cards */}
      <div className="space-y-4">
        {barangayData.length === 0 ? (
          <div className="rounded-xl p-10 text-center" style={card}>
            <p className="text-sm" style={muted}>
              No barangays found{searchTerm ? ` matching "${searchTerm}"` : ""}.
            </p>
          </div>
        ) : (
          barangayData.map((barangay) => (
            <div key={barangay.name} className="rounded-xl p-6" style={card}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1" style={label}>
                    Barangay {barangay.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm" style={muted}>
                    <span>{barangay.projectCount} projects</span>
                    <span>•</span>
                    <span>{barangay.ongoingProjects} ongoing</span>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: darkMode ? "#64748b" : "#94a3b8" }}
                  >
                    Total Budget
                  </p>
                  <p className="text-xl font-bold" style={{ color: "#3b82f6" }}>
                    {fmt(barangay.totalBudget)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {barangay.projects.map((project, idx) => (
                  <div
                    key={project.id ?? idx}
                    className="p-4 rounded-lg border"
                    style={{
                      background: darkMode ? "#1e293b" : "#f8fafc",
                      borderColor: darkMode ? "#334155" : "#e2e8f0",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded"
                            style={{ background: "#004A98", color: "#ffffff" }}
                          >
                            {project.year}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold mb-2" style={label}>
                          {project.project}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          {(project.components || [])
                            .filter(Boolean)
                            .map((componentCode, compIndex) => (
                              <span
                                key={`${project.id}-comp-${compIndex}-${componentCode}`}
                                className="text-xs font-medium px-2 py-1 rounded"
                                style={{
                                  backgroundColor: `${getCompColor(componentCode)}20`,
                                  color: getCompColor(componentCode),
                                }}
                              >
                                {componentCode?.toUpperCase() || 'N/A'}
                              </span>
                            ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold" style={{ color: "#3b82f6" }}>
                          {fmt(project.amountFunded || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BarangaysPage;