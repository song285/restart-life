
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsState, Contact } from '../types';
import { api } from '../services/api';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsState & { email: string }>({
    emailNotify: true,
    smsNotify: true,
    autoAlarm: false,
    email: 'user@example.com'
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', type: 'mobile' as 'mobile' | 'home' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取设置
        const settingsData = await api.getSettings();
        if (settingsData) {
          setSettings({
            emailNotify: settingsData.email_notify ?? true,
            smsNotify: settingsData.sms_notify ?? true,
            autoAlarm: settingsData.auto_alarm ?? false,
            email: settingsData.email || ''
          });
        } else {
          // 如果没有设置，使用默认值
          console.log('⚠️  未获取到设置数据，使用默认值');
          setSettings({
            emailNotify: true,
            smsNotify: true,
            autoAlarm: false,
            email: ''
          });
        }

        // 获取联系人
        const contactsData = await api.getContacts();
        setContacts(contactsData || []);
      } catch (error: any) {
        console.error('获取数据失败:', error);
        // 出错时使用默认值
        setSettings({
          emailNotify: true,
          smsNotify: true,
          autoAlarm: false,
          email: ''
        });
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSetting = (key: keyof SettingsState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    
    try {
      const contact = await api.createContact(newContact);
      setContacts(prev => [...prev, contact]);
      setNewContact({ name: '', phone: '', type: 'mobile' });
      setIsAddingContact(false);
    } catch (error: any) {
      console.error('添加联系人失败:', error);
      alert(error.message || '添加联系人失败');
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('确定要删除这个联系人吗？')) return;
    
    try {
      await api.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (error: any) {
      console.error('删除联系人失败:', error);
      alert(error.message || '删除联系人失败');
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.updateSettings({
        email_notify: settings.emailNotify,
        sms_notify: settings.smsNotify,
        auto_alarm: settings.autoAlarm,
        email: settings.email
      });
      alert('所有设置已保存');
    } catch (error: any) {
      console.error('保存设置失败:', error);
      alert(error.message || '保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex flex-col h-screen w-full max-w-[430px] mx-auto bg-slate-50 overflow-y-auto p-6 animate-in fade-in duration-700 bg-slate-50 min-h-screen">
        <h2 className="text-2xl font-bold text-slate-900">安全与预警设置</h2>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen w-full max-w-[430px] mx-auto bg-slate-50 overflow-y-auto p-6 animate-in fade-in duration-700 bg-slate-50 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900">安全与预警设置</h2>

      <div className="flex flex-col gap-2 pt-6 pb-20">
        {/* Status Banner */}
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 p-4 rounded-2xl mb-4">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary fill-icon">verified_user</span>
          </div>
          <div>
            <p className="text-slate-900 text-sm font-bold">系统运行中</p>
            <p className="text-slate-500 text-xs font-medium">正在实时监测您的居家安全状态</p>
          </div>
        </div>

        {/* Notifications Section */}
        <h3 className="text-slate-400 text-xs font-bold leading-tight tracking-wider uppercase px-1 pb-2 pt-4">通知与预警</h3>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          <SettingRow 
            icon="mail" 
            title="邮件通知" 
            description="若错过打卡，将向您的邮箱发送提醒。"
            checked={settings.emailNotify}
            onChange={() => toggleSetting('emailNotify')}
          />
          {settings.emailNotify && (
            <div className="px-16 pb-4 pt-4 animate-fade-in-up">
              <input 
                type="email"
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="输入通知邮箱"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          )}
          <SettingRow 
            icon="emergency_home" 
            title="自动报警配置" 
            description="若超过12小时无响应，自动通知紧急联系人。"
            checked={settings.autoAlarm}
            onChange={() => toggleSetting('autoAlarm')}
            danger
          />
        </div>

        {/* Contacts Section */}
        <div className="flex items-center justify-between px-1 pb-2 pt-8">
            <h3 className="text-slate-400 text-xs font-bold leading-tight tracking-wider uppercase">紧急联系人</h3>
            <span className="text-slate-400 text-xs font-medium">{contacts.length}/5</span>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          {contacts.map(contact => (
            <div key={contact.id} className="group flex items-center gap-4 px-4 min-h-[72px] py-3 justify-between border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-full bg-slate-100 shrink-0 size-10 text-primary font-bold">
                  {contact.name.slice(0, 1)}
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-slate-900 text-base font-bold leading-normal">{contact.name}</p>
                  <p className="text-slate-500 text-sm font-medium leading-tight">{contact.phone} • {contact.type === 'mobile' ? '手机' : '住宅'}</p>
                </div>
              </div>
              <button 
                onClick={() => deleteContact(contact.id)}
                className="size-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ))}
          
          <button 
            onClick={() => setIsAddingContact(true)}
            className="flex w-full items-center gap-4 px-4 min-h-[64px] py-3 text-primary font-bold hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center justify-center rounded-full bg-primary/10 shrink-0 size-10">
              <span className="material-symbols-outlined">add</span>
            </div>
            <p className="text-base">添加紧急联系人</p>
          </button>
        </div>

        {/* Footer info */}
        <p className="text-slate-400 text-[11px] text-center leading-relaxed font-medium">
          您的数据已加密，仅在触发预警时共享给紧急服务部门或您指定的联系人。
        </p>

        <div className="pb-10 pt-4">
          <button 
            onClick={handleSaveSettings}
            disabled={saving || loading}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : '保存并应用'}
          </button>
        </div>
      </div>

      {/* Add Contact Modal */}
      {isAddingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 animate-fade-in-up">
            <h4 className="text-xl font-bold text-slate-900 mb-6">新增联系人</h4>
            <form onSubmit={handleAddContact} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">姓名</label>
                <input 
                  autoFocus
                  required
                  type="text"
                  value={newContact.name}
                  onChange={e => setNewContact(prev => ({...prev, name: e.target.value}))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="请输入联系人姓名"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">电话</label>
                <input 
                  required
                  type="tel"
                  value={newContact.phone}
                  onChange={e => setNewContact(prev => ({...prev, phone: e.target.value}))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="请输入联系电话"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setNewContact(prev => ({...prev, type: 'mobile'}))}
                  className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${newContact.type === 'mobile' ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-500'}`}
                >手机</button>
                <button 
                  type="button"
                  onClick={() => setNewContact(prev => ({...prev, type: 'home'}))}
                  className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${newContact.type === 'home' ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-500'}`}
                >住宅</button>
              </div>
              <div className="flex gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddingContact(false)}
                  className="flex-1 py-4 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-all"
                >取消</button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >确定添加</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface SettingRowProps {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  danger?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, title, description, checked, onChange, danger }) => (
  <div className="flex items-center gap-4 px-4 min-h-[72px] py-3 justify-between border-b border-slate-100 last:border-b-0">
    <div className="flex items-center gap-4">
      <div className={`flex items-center justify-center rounded-xl shrink-0 size-12 ${danger ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex flex-col justify-center">
        <p className={`text-slate-900 text-base leading-normal ${danger ? 'font-bold text-red-600' : 'font-bold'}`}>{title}</p>
        <p className="text-slate-500 text-xs font-medium leading-tight max-w-[180px]">{description}</p>
      </div>
    </div>
    <div className="shrink-0">
      <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-slate-200 p-0.5 transition-colors has-[:checked]:justify-end has-[:checked]:bg-primary">
        <div className="h-full w-[27px] rounded-full bg-white shadow-md"></div>
        <input 
          checked={checked} 
          onChange={onChange} 
          className="invisible absolute" 
          type="checkbox" 
        />
      </label>
    </div>
  </div>
);

export default Settings;
