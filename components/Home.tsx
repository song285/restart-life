
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Home: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [content, setContent] = useState({ greeting: '平安，', subtitle: '万物可爱，人间值得。' });
  const [lastCheckIn, setLastCheckIn] = useState<string>('加载中...');
  const [nextExpected, setNextExpected] = useState<string>('下午 8:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取问候语
        const greetingData = await api.getDailyGreeting();
        setContent(greetingData);

        // 检查今天是否已打卡
        const { hasCheckedIn } = await api.hasCheckedInToday();
        setIsCheckedIn(hasCheckedIn || false); // 确保是布尔值

        // 获取最后一次打卡信息
        const { lastCheckIn: lastCheckInData } = await api.getLastCheckIn();
        if (lastCheckInData) {
          const lastTime = new Date(lastCheckInData);
          const now = new Date();
          const diffMs = now.getTime() - lastTime.getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          
          if (diffHours > 0) {
            setLastCheckIn(`${diffHours}小时前`);
          } else if (diffMins > 0) {
            setLastCheckIn(`${diffMins}分钟前`);
          } else {
            setLastCheckIn('刚刚');
          }
        } else {
          // 新用户没有打卡记录
          setLastCheckIn('从未打卡');
          setIsCheckedIn(false); // 确保显示未打卡状态
        }

        // 获取统计信息以获取下次预计时间
        const stats = await api.getCheckInStats();
        if (stats && stats.nextExpected) {
          const nextTime = new Date(stats.nextExpected);
          const hours = nextTime.getHours();
          const mins = nextTime.getMinutes();
          setNextExpected(`${hours > 12 ? '下午' : '上午'} ${hours % 12 || 12}:${mins.toString().padStart(2, '0')}`);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        // 出错时重置为默认状态
        setLastCheckIn('从未打卡');
        setIsCheckedIn(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckIn = async () => {
    if (isCheckedIn || loading) return;
    
    setLoading(true);
    try {
      await api.createCheckIn();
      setIsCheckedIn(true);
      setLastCheckIn('刚刚');
    } catch (error: any) {
      console.error('打卡失败:', error);
      if (error.message.includes('已经打卡过了')) {
        setIsCheckedIn(true);
        setLastCheckIn('刚刚');
      } else {
        alert('打卡失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-mesh overflow-hidden p-6 animate-in fade-in duration-700 bg-slate-50 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900">首页</h2>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="max-w-xs text-center mb-16 transition-all duration-700">
          <h1 className="text-slate-900 text-3xl font-light leading-snug tracking-tight mb-3">
            {content.greeting.split('，')[0]}<br />
            <span className="font-bold text-primary">{content.greeting.split('，')[1] || '你今天也超赞'}</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">{content.subtitle}</p>
        </div>

        <div className="relative flex flex-col items-center justify-center">
          {/* Auras and Particles */}
          <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 scale-150 ${
            isCheckedIn ? 'bg-success-heart/10 opacity-100' : 'bg-primary/10 opacity-0'
          }`}></div>
          
          <div className={`absolute inset-0 rounded-full bg-primary/5 animate-slow-pulse scale-125 transition-opacity ${isCheckedIn ? 'opacity-0' : 'opacity-100'}`}></div>

          {/* Confetti (only shown when checked in) */}
          {isCheckedIn && (
            <div className="absolute inset-[-100px] pointer-events-none">
              <span className="material-symbols-outlined absolute top-0 left-1/4 text-success-heart/40 fill-icon text-xl animate-bounce"></span>
              <span className="material-symbols-outlined absolute top-10 right-1/4 text-success-heart/60 fill-icon text-2xl animate-pulse"></span>
              <span className="material-symbols-outlined absolute bottom-0 left-1/3 text-success-heart/30 fill-icon text-lg animate-bounce"></span>
              <span className="material-symbols-outlined absolute top-1/2 right-0 text-success-heart/50 fill-icon text-xl animate-pulse"></span>
            </div>
          )}

          <button
            onClick={handleCheckIn}
            disabled={isCheckedIn || loading}
            className={`relative flex flex-col items-center justify-center size-60 rounded-full transition-all duration-500 z-10 active:scale-95 shadow-2xl ${
              isCheckedIn 
                ? 'bg-success-heart scale-110 shadow-[0_15px_40px_rgba(255,77,109,0.3)]' 
                : 'bg-primary shadow-[0_20px_60px_-15px_rgba(19,127,236,0.4)]'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {!isCheckedIn ? (
              <>
                <span className="text-white text-xl font-medium tracking-widest uppercase">重启人生</span>
              </>
            ) : (
              <span className="material-symbols-outlined text-white text-8xl fill-icon animate-ping duration-[3000ms]">favorite</span>
            )}
          </button>

          {isCheckedIn && (
            <div className="absolute top-full mt-10 w-64 text-center animate-fade-in-up">
              <p className="text-slate-800 text-xl font-medium leading-relaxed tracking-wide italic">
                “真棒，又活了一天，<br />好好爱自己”
              </p>
            </div>
          )}
        </div>

        <div className={`mt-16 text-center transition-opacity duration-500 ${isCheckedIn ? 'opacity-0' : 'opacity-100'}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/60 border border-slate-200 rounded-full backdrop-blur-md shadow-sm">
            <span className="size-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></span>
            <p className="text-slate-600 text-xs font-bold tracking-wide">上次打卡：{lastCheckIn}</p>
          </div>
          <p className="text-slate-400 text-[11px] mt-4 tracking-widest font-bold uppercase">下次预计：{nextExpected}</p>
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[20%] left-[-20%] size-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[-20%] size-[400px] bg-blue-500/5 blur-[100px] rounded-full"></div>
      </div>
    </div>
  );
};

export default Home;
