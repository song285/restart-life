
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../services/api';

const AnalyticsView: React.FC = () => {
  const [stats, setStats] = useState({
    weeklyTotal: 0,
    weeklyData: [
      { name: '周日', count: 0 },
      { name: '周一', count: 0 },
      { name: '周二', count: 0 },
      { name: '周三', count: 0 },
      { name: '周四', count: 0 },
      { name: '周五', count: 0 },
      { name: '周六', count: 0 },
    ],
    consecutiveDays: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getCheckInStats();
        setStats(data);
      } catch (error) {
        console.error('获取统计失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 获取当前周信息
  const getWeekInfo = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const weekNumber = Math.ceil((now.getDate() + 6 - now.getDay()) / 7);
    return `${month}月第${weekNumber}周`;
  };

  // 找到今天对应的索引（用于高亮）
  const todayIndex = new Date().getDay();

  if (loading) {
    return (
      <div className="p-6 pb-32 animate-in fade-in duration-700 bg-slate-50 min-h-screen">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">打卡统计</h2>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32 animate-in fade-in duration-700 bg-slate-50 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900 mb-8">打卡统计</h2>
      
      <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">本周概览</h3>
            <span className="text-primary text-xs font-bold bg-primary/5 px-3 py-1 rounded-full">{getWeekInfo()}</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weeklyData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} />
              <Tooltip 
                cursor={{ fill: 'rgba(19, 127, 236, 0.05)' }} 
                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={32}>
                {stats.weeklyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === todayIndex ? '#137fec' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">本周总计</p>
          <p className="text-3xl font-black text-slate-900">{stats.weeklyTotal}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">连续打卡</p>
          <p className="text-3xl font-black text-slate-900">{stats.consecutiveDays}</p>
          <p className="text-primary text-[10px] mt-2 font-bold uppercase tracking-widest">天</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
