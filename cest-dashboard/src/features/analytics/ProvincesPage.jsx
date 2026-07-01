import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, TrendingUp, ArrowRight, MapPin, Activity, Landmark } from "lucide-react";
import { Breadcrumb } from "../../components/layout/Breadcrumb";
import { fmt } from "../../shared/utils/helpers";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getAllProvinces } from "../../shared/data/regionII";
import { transformProjects } from "../../shared/utils/dataTransform";
import { ChartTooltip, renderChartTooltip } from "../../components/ui/ChartTooltip";

const CHART_COLORS = ["#A78BFA", "#F472B6", "#FBBF24", "#34D399", "#60A5FA"];


const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
};


const LiveIndicator = ({ darkMode }) => (
  <div className="flex items-center gap-2">
    <div className="relative flex items-center">
      <div 
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ background: '#3b82f6' }}
      />
      <div 
        className="absolute w-2 h-2 rounded-full animate-ping"
        style={{ background: '#3b82f6' }}
      />
    </div>
    <span 
      className="text-xs font-semibold"
      style={{ color: '#3b82f6' }}
    >
      LIVE
    </span>
  </div>
);

export const ProvincesPage = ({ projects, darkMode }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  
  const transformedProjects = transformProjects(projects);

  
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  
  const REGION_II_PROVINCES = getAllProvinces();

  
  const provinceData = REGION_II_PROVINCES.map((province) => {
    const provinceProjects = transformedProjects.filter(
      (p) => p.province?.toLowerCase() === province.name.toLowerCase()
    );
    
    const totalBudget = provinceProjects.reduce((sum, p) => sum + Number(p.amountFunded || 0), 0);
    const municipalities = new Set(provinceProjects.map((p) => p.municipality)).size;
    const barangays = new Set(provinceProjects.map((p) => p.community)).size;

    return {
      ...province,
      projectCount: provinceProjects.length,
      totalBudget,
      municipalities,
      barangays,
    };
  }).filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  
  const chartData = provinceData
    .filter((p) => p.totalBudget > 0)
    .sort((a, b) => b.totalBudget - a.totalBudget)
    .map((p) => ({
      name: p.code,
      fullName: p.name,
      budget: p.totalBudget,
    }));

  const maxBudget = chartData.reduce((m, d) => Math.max(m, d.budget), 0);
  const fmtChart = (v) =>
    maxBudget >= 1_000_000 ? `₱${(v / 1_000_000).toFixed(1)}M` : `₱${(v / 1_000).toFixed(0)}k`;

  
  const pieData = chartData.map((d, i) => ({
    name: d.fullName,
    value: d.budget,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const totalBudget = provinceData.reduce((sum, p) => sum + p.totalBudget, 0);
  const totalProjects = provinceData.reduce((sum, p) => sum + p.projectCount, 0);
  const totalMunicipalities = provinceData.reduce((sum, p) => sum + p.municipalities, 0);
  const totalBarangays = provinceData.reduce((sum, p) => sum + p.barangays, 0);

  const cardStyle = {
    background: darkMode ? "#0f172a" : "#ffffff",
    border: `1px solid ${darkMode ? "#1e293b" : "#e5e7eb"}`,
    boxShadow: darkMode ? "0 1px 3px rgba(0, 0, 0, 0.5)" : "0 1px 3px rgba(0, 0, 0, 0.05)",
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 sm:space-y-6 w-full min-w-0">
      <Breadcrumb items={[{ label: "Region II Analytics" }]} darkMode={darkMode} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1
            className="text-xl sm:text-2xl font-semibold leading-snug mb-2"
            style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
          >
            Region II — Cagayan Valley
          </h1>
          <p className="text-sm" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
            Select a province to view detailed analytics
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 sm:flex-col sm:items-end sm:justify-start shrink-0">
          <LiveIndicator darkMode={darkMode} />
          <div className="text-right">
            <p className="text-xs font-medium mb-0.5" style={{ color: darkMode ? "#64748b" : "#94a3b8" }}>
              Last Updated
            </p>
            <p className="text-sm font-semibold tabular-nums" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
              {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Budget", value: totalBudget, icon: TrendingUp, color: "#004A98", isAmount: true },
          { label: "Total Projects", value: totalProjects, icon: Building2, color: "#3b82f6", isAmount: false },
          { label: "Municipalities/Cities", value: totalMunicipalities, icon: Landmark, color: "#f59e0b", isAmount: false },
          { label: "Barangays", value: totalBarangays, icon: MapPin, color: "#8b5cf6", isAmount: false },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl p-5 relative overflow-hidden group min-h-[140px]" style={cardStyle}>
              {}
              <div
                className="absolute right-2 bottom-2 w-20 h-20 opacity-[0.07] pointer-events-none"
                aria-hidden="true"
              >
                <Icon className="w-full h-full" style={{ color: stat.color }} strokeWidth={1.25} />
              </div>

              {}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                <Activity className="w-3 h-3 animate-pulse" style={{ color: '#3b82f6' }} />
                <span className="text-[10px] font-bold tracking-wide" style={{ color: '#3b82f6' }}>
                  LIVE
                </span>
              </div>

              <div className="relative z-10 pr-14">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${stat.color}18`, boxShadow: `0 4px 14px ${stat.color}22` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} strokeWidth={2.25} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
                  {stat.isAmount ? fmt(stat.value) : <AnimatedCounter value={stat.value} />}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {}
      <div className="rounded-xl p-5" style={cardStyle}>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search provinces..."
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

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        {chartData.length > 0 && (
          <div className="rounded-xl p-6 relative" style={cardStyle}>
            <div className="absolute top-4 right-4">
              <LiveIndicator darkMode={darkMode} />
            </div>
            
            <h3 className="text-lg font-semibold mb-1" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
              Budget Distribution
            </h3>
            <p className="text-sm mb-6" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
              Total budget by province
            </p>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 30, right: 10, left: 10, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: darkMode ? "#94a3b8" : "#64748b", fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: darkMode ? "#334155" : "#e5e7eb", strokeWidth: 1 }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: darkMode ? "#94a3b8" : "#64748b", fontWeight: 500 }}
                  tickFormatter={fmtChart}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip
                  content={(props) =>
                    renderChartTooltip({
                      ...props,
                      valueFormatter: fmtChart,
                      hint: "Click to view details",
                    })
                  }
                  cursor={{ fill: darkMode ? "rgba(148, 163, 184, 0.05)" : "rgba(226, 232, 240, 0.5)" }}
                />
                <Bar 
                  dataKey="budget" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={80}
                  onClick={(data) => {
                    if (data && data.fullName) {
                      const province = provinceData.find(p => p.name === data.fullName);
                      if (province) {
                        navigate(`/analytics/provinces/${province.id}`);
                      }
                    }
                  }}
                  cursor="pointer"
                  animationDuration={800}
                  animationBegin={0}
                  label={{
                    position: 'top',
                    formatter: (value) => fmtChart(value),
                    fontSize: 11,
                    fontWeight: 600,
                    fill: darkMode ? '#f8fafc' : '#0f172a'
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      stroke={darkMode ? '#0f172a' : '#ffffff'}
                      strokeWidth={2}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {}
        {pieData.length > 0 && (
          <div className="rounded-xl p-6 relative" style={cardStyle}>
            <div className="absolute top-4 right-4">
              <LiveIndicator darkMode={darkMode} />
            </div>
            
            <h3 className="text-lg font-semibold mb-1" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
              Budget Share
            </h3>
            <p className="text-sm mb-6" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
              Percentage distribution across provinces
            </p>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  dataKey="value"
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  onClick={(data) => {
                    if (data && data.name) {
                      const province = provinceData.find(p => p.name === data.name);
                      if (province) {
                        navigate(`/analytics/provinces/${province.id}`);
                      }
                    }
                  }}
                  cursor="pointer"
                  animationDuration={800}
                  animationBegin={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                      stroke={darkMode ? "#0f172a" : "#ffffff"}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={(props) =>
                    renderChartTooltip({
                      ...props,
                      valueFormatter: fmtChart,
                      hint: "Click to view details",
                    })
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {}
      <div>
        <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}>
          All Provinces
        </h3>
        <p className="text-sm mb-5" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
          Tap a province to open city-level analytics
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {provinceData.map((province) => (
            <button
              key={province.id}
              onClick={() => navigate(`/analytics/provinces/${province.id}`)}
              className="text-left rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg group border-l-4"
              style={{
                ...cardStyle,
                borderLeftColor: "#004A98",
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="min-w-0">
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-1"
                    style={{ color: darkMode ? "#64748b" : "#94a3b8" }}
                  >
                    Province
                  </p>
                  <h3
                    className="text-lg sm:text-xl font-bold leading-tight"
                    style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
                  >
                    {province.name}
                  </h3>
                </div>
                <div
                  className="p-2.5 rounded-xl shrink-0"
                  style={{ background: "rgba(0, 74, 152, 0.12)" }}
                >
                  <Building2 className="w-5 h-5" style={{ color: "#004A98" }} />
                </div>
              </div>

              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <p
                    className="text-4xl sm:text-5xl font-bold tabular-nums leading-none mb-1.5"
                    style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
                  >
                    {province.projectCount}
                  </p>
                  <p className="text-sm font-bold uppercase tracking-wide" style={{ color: "#004A98" }}>
                    Projects
                  </p>
                </div>
                <div className="text-right pb-0.5">
                  <p className="text-lg sm:text-xl font-bold tabular-nums" style={{ color: "#3b82f6" }}>
                    {fmt(province.totalBudget)}
                  </p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                    Total budget
                  </p>
                </div>
              </div>

              <div
                className="grid grid-cols-2 gap-3 pt-3 border-t text-sm"
                style={{ borderColor: darkMode ? "#1e293b" : "#e5e7eb" }}
              >
                <div>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: darkMode ? "#e2e8f0" : "#1e293b" }}>
                    {province.municipalities}
                  </p>
                  <p className="text-xs font-medium" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                    Municipalities
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: darkMode ? "#e2e8f0" : "#1e293b" }}>
                    {province.barangays}
                  </p>
                  <p className="text-xs font-medium" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                    Barangays
                  </p>
                </div>
              </div>

              <p
                className="text-xs font-semibold mt-4 flex items-center gap-1.5 group-hover:gap-2 transition-all"
                style={{ color: "#004A98" }}
              >
                View cities
                <ArrowRight className="w-3.5 h-3.5" />
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
