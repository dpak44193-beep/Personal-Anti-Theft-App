import React, { useEffect, useState } from 'react';
import { useAuth, useDevices, useAlerts, useThreats } from '../services';
import { Shield, AlertTriangle, MapPin, Activity, Battery, Wifi, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardWithAPI = () => {
  const { user, loading: authLoading } = useAuth();
  const { devices } = useDevices(user?.id);
  
  const activeDevice = devices?.[0]; // Get first device
  const { alerts } = useAlerts(activeDevice?.id);
  const { threats } = useThreats(activeDevice?.id);

  const [securityScore, setSecurityScore] = useState(94);
  const [activityData, setActivityData] = useState([
    { time: '00:00', events: 2, alerts: 0 },
    { time: '03:00', events: 1, alerts: 0 },
    { time: '06:00', events: 3, alerts: 0 },
  ]);

  // Calculate security score based on threats
  useEffect(() => {
    const criticalThreats = threats?.filter(t => t.severity === 'critical').length || 0;
    const highThreats = threats?.filter(t => t.severity === 'high').length || 0;
    const score = Math.max(0, 100 - (criticalThreats * 10 + highThreats * 5));
    setSecurityScore(score);
  }, [threats]);

  if (authLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-full">Please log in</div>;
  }

  const statCards = [
    {
      label: 'Security Score',
      value: securityScore.toString(),
      unit: '/100',
      delta: threats?.length ? `${threats.length} threats` : 'All clear',
      positive: securityScore > 80,
      icon: Shield,
      color: securityScore > 80 ? '#39FF14' : '#FF9F00',
    },
    {
      label: 'Active Threats',
      value: threats?.length?.toString() || '0',
      unit: 'detected',
      delta: 'Last scan: 2m ago',
      positive: !threats?.length,
      icon: AlertTriangle,
      color: threats?.length ? '#FF0000' : '#39FF14',
    },
    {
      label: 'Device Status',
      value: activeDevice?.battery || '--',
      unit: '%',
      delta: activeDevice ? 'Online' : 'Offline',
      positive: true,
      icon: Battery,
      color: '#39FF14',
    },
    {
      label: 'Connected',
      value: '3',
      unit: 'devices',
      delta: 'All synced',
      positive: true,
      icon: Wifi,
      color: '#39FF14',
    },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <div
              key={idx}
              className="rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition"
              style={{
                background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.05) 0%, rgba(255, 159, 0, 0.02) 100%)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">{card.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {card.value}
                    <span className="text-sm text-gray-400 ml-1">{card.unit}</span>
                  </p>
                </div>
                <IconComponent size={24} style={{ color: card.color }} />
              </div>
              <p className="text-xs" style={{ color: card.positive ? '#39FF14' : '#FF9F00' }}>
                {card.delta}
              </p>
            </div>
          );
        })}
      </div>

      {/* Activity Chart */}
      <div
        className="rounded-lg p-4 border border-gray-700"
        style={{
          background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.05) 0%, rgba(255, 159, 0, 0.02) 100%)',
        }}
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Activity size={18} style={{ color: '#39FF14' }} />
          24-Hour Activity
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={activityData}>
            <defs>
              <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="events" stroke="#39FF14" fillOpacity={1} fill="url(#colorEvents)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Alerts */}
      <div
        className="rounded-lg p-4 border border-gray-700"
        style={{
          background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.05) 0%, rgba(255, 159, 0, 0.02) 100%)',
        }}
      >
        <h3 className="text-white font-semibold mb-4">Recent Alerts</h3>
        <div className="space-y-2">
          {alerts?.slice(0, 5).map((alert: any) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded bg-gray-900/50 border-l-4"
              style={{
                borderColor: alert.type === 'danger' ? '#FF0000' : alert.type === 'warning' ? '#FF9F00' : '#39FF14',
              }}
            >
              <AlertTriangle
                size={16}
                style={{
                  color: alert.type === 'danger' ? '#FF0000' : alert.type === 'warning' ? '#FF9F00' : '#39FF14',
                  marginTop: '2px',
                  flexShrink: 0,
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {!alerts || alerts.length === 0 && (
            <p className="text-sm text-gray-400">No alerts</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardWithAPI;
