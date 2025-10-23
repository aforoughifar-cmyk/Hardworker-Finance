import React, { useState, useMemo } from 'react';
import { AuditLog, Kullanici } from '../types';
import DatePickerInput from './DatePickerInput';
import { SearchIcon } from './icons/AppIcons';

interface AuditLogPageProps {
    logs: AuditLog[];
    kullanicilar: Kullanici[];
}

const AuditLogPage: React.FC<AuditLogPageProps> = ({ logs, kullanicilar }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState<number | ''>('');
    const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const userMatch = userFilter === '' || log.kullaniciId === userFilter;
            const searchMatch = searchTerm === '' || 
                                log.eylem.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                log.detay.toLowerCase().includes(searchTerm.toLowerCase());
            const dateMatch = (!dateRange.start || log.timestamp >= dateRange.start) &&
                              (!dateRange.end || log.timestamp.split('T')[0] <= dateRange.end);

            return userMatch && searchMatch && dateMatch;
        });
    }, [logs, searchTerm, userFilter, dateRange]);

    const formatTimestamp = (ts: string) => {
        return new Date(ts).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-full">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Aktivite Kayıtları</h1>
                <p className="text-slate-500 mt-2 text-lg">Uygulamada gerçekleştirilen tüm kullanıcı eylemlerini izleyin.</p>
            </header>

            <main className="bg-white p-6 rounded-xl shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-lg">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Eylem veya detayda ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                    </div>
                    <div>
                        <select value={userFilter} onChange={e => setUserFilter(e.target.value ? Number(e.target.value) : '')} className="w-full p-2 border rounded-lg">
                            <option value="">Tüm Kullanıcılar</option>
                            {kullanicilar.map(user => (
                                <option key={user.id} value={user.id}>{user.kullaniciAdi}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                         <DatePickerInput value={dateRange.start} onChange={date => setDateRange(r => ({...r, start: date}))} />
                         <span>-</span>
                         <DatePickerInput value={dateRange.end} onChange={date => setDateRange(r => ({...r, end: date}))} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tarih/Saat</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kullanıcı</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Eylem</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Detay</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatTimestamp(log.timestamp)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{log.kullaniciAdi}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.eylem}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{log.detay}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredLogs.length === 0 && (
                        <p className="text-center py-12 text-slate-500">Bu kriterlere uygun bir aktivite kaydı bulunamadı.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AuditLogPage;
