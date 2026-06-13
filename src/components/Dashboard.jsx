import { Leaf, Plane, Car, Globe, Calendar, TreePine, ArrowRight } from 'lucide-react';
import countryAverages from '../data/country_averages.json';

const Dashboard = ({ result, onReset }) => {
  const { total, breakdown } = result;

  // Equivalencies
  const treesNeeded = Math.round(total / 22); // 1 tree absorbs ~22kg CO2/year
  const nycToLondonFlights = (total / 900).toFixed(1); // 1 flight ~900kg CO2
  const carKmEquivalent = Math.round(total / 0.368); // petrol car ~0.368kg CO2/km

  // Category list for display
  const categories = [
    { name: 'Transportation', value: breakdown.transport, color: '#10b981', icon: <Car size={18} /> },
    { name: 'Food & Groceries', value: breakdown.food, color: '#34d399', icon: <UtensilsIcon size={18} /> },
    { name: 'Home Energy', value: breakdown.energy, color: '#60a5fa', icon: <ZapIcon size={18} /> },
    { name: 'Waste & Garbage', value: breakdown.waste, color: '#f59e0b', icon: <TrashIcon size={18} /> },
    { name: 'Other (Profile & Shopping)', value: breakdown.other, color: '#a78bfa', icon: <Leaf size={18} /> }
  ];

  // Badge classification
  let badgeName = 'Moderate Consumer';
  let badgeColor = '#f59e0b';
  let badgeDescription = 'Your footprint is around the global average. There is solid room for improvement.';

  if (total < 1200) {
    badgeName = 'Eco-Guardian (Elite)';
    badgeColor = '#10b981';
    badgeDescription = 'Outstanding! Your footprint is extremely low. You are living sustainably.';
  } else if (total < 2500) {
    badgeName = 'Carbon Conscious';
    badgeColor = '#34d399';
    badgeDescription = 'Well done! You are keeping your footprint below average through positive habits.';
  } else if (total > 5000) {
    badgeName = 'High Impact';
    badgeColor = '#ef4444';
    badgeDescription = 'Warning: Your footprint is quite high. Look at the transport and energy suggestions to reduce it.';
  }

  // Calculate percentages for SVG Donut Chart
  const filteredCategories = categories.filter(c => c.value > 0);
  const totalBreakdown = filteredCategories.reduce((sum, c) => sum + c.value, 0);
  
  let accumulatedPercent = 0;
  const donutSlices = filteredCategories.map((cat) => {
    const percent = (cat.value / (totalBreakdown || 1)) * 100;
    const start = accumulatedPercent;
    accumulatedPercent += percent;
    return { ...cat, start, end: accumulatedPercent, percent };
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner Summary */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(15, 23, 18, 0.8))',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div>
          <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}><Calendar size={12} aria-hidden="true" style={{ marginRight: '4px' }} /> ANNUAL REPORT</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '0.25rem 0' }}>Your Annual Footprint</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Based on your detailed profile and lifestyle inputs</p>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-mint)', lineHeight: '1' }}>
              {(total / 1000).toFixed(2)} <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-secondary)' }}>tons CO₂e</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Total: {total.toLocaleString()} kg CO₂ / year
            </div>
          </div>
          
          <div style={{
            borderLeft: '1px solid var(--border-color)',
            paddingLeft: '1.5rem',
            textAlign: 'left',
            maxWidth: '220px'
          }}>
            <div style={{ fontWeight: '700', color: badgeColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Leaf size={16} aria-hidden="true" /> {badgeName}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {badgeDescription}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid-cols-1-2">
        {/* Left Side: Category breakdown list */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Leaf size={18} className="text-emerald" aria-hidden="true" /> Breakdown by Category
          </h3>
          
          {/* Custom SVG Donut Chart */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="20" />
              {donutSlices.map((slice, i) => {
                const radius = 80;
                const circumference = 2 * Math.PI * radius;
                const strokeDasharray = `${(slice.percent / 100) * circumference} ${circumference}`;
                // Calculate rotation offset based on start percentage
                const strokeDashoffset = `${- (slice.start / 100) * circumference}`;
                
                return (
                  <circle
                    key={i}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 100 100)"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                );
              })}
              <text x="100" y="98" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="800">
                {Math.round(total).toLocaleString()}
              </text>
              <text x="100" y="120" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="600">
                kg CO₂ / yr
              </text>
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {categories.map((cat, i) => {
              const pct = total > 0 ? ((cat.value / total) * 100).toFixed(1) : 0;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      backgroundColor: cat.color
                    }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{cat.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{cat.value.toLocaleString()} kg</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Global Comparison + Equivalencies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Global Comparison Chart */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} className="text-emerald" aria-hidden="true" /> Global Benchmark Comparison
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              How does your personal footprint compare to the annual per capita emissions of different countries?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {Object.entries(countryAverages).map(([country, avgValue]) => {
                const isUser = country === 'Platform Average';
                const displayName = isUser ? 'Your Footprint' : `${country} Average`;
                const maxBenchmark = 16000; // USA
                const pctOfMax = (avgValue / maxBenchmark) * 100;
                
                // If it is the user, we represent our actual total, not the platform average variable
                const displayVal = isUser ? total : avgValue;
                const userPct = (total / maxBenchmark) * 100;
                const widthPct = isUser ? Math.min(100, userPct) : Math.min(100, pctOfMax);

                return (
                  <div key={country} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: isUser ? '700' : '500' }}>
                      <span style={{ color: isUser ? 'var(--accent-mint)' : 'var(--text-secondary)' }}>
                        {displayName} {isUser && '⭐'}
                      </span>
                      <span>{Math.round(displayVal).toLocaleString()} kg CO₂</span>
                    </div>
                    <div style={{ height: '12px', background: 'var(--bg-primary)', borderRadius: '99px', overflow: 'hidden', border: isUser ? '1px solid var(--accent-mint)' : 'none' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${widthPct}%`,
                          background: isUser
                            ? 'linear-gradient(90deg, var(--accent-emerald), var(--accent-mint))'
                            : 'rgba(255, 255, 255, 0.15)',
                          borderRadius: '99px',
                          boxShadow: isUser ? 'var(--shadow-glow)' : 'none',
                          transition: 'width 0.6s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Equivalency metrics */}
          <div className="grid-cols-3">
            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-mint)' }}>
                <TreePine size={24} aria-hidden="true" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{treesNeeded}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Trees to Plant</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Needed to offset your emissions over a year</div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }}>
                <Plane size={24} aria-hidden="true" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{nycToLondonFlights}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>NY to London Flights</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Equivalent flights in terms of carbon emissions</div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <Car size={24} aria-hidden="true" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{carKmEquivalent.toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Petrol Km Driven</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Driving equivalent of your annual carbon footprint</div>
            </div>
          </div>

          {/* Action Call / Next step */}
          <div className="glass-card" style={{
            background: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.75rem'
          }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Want to lower your emissions?</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Check our AI Insights for personalized action plans.</div>
            </div>
            
            <button
              onClick={onReset}
              className="glow-btn-secondary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              Re-calculate <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// Simple inline Icons for dependencies
const UtensilsIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z" />
    <path d="M19 15v7" />
  </svg>
);

const ZapIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const TrashIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

export default Dashboard;
