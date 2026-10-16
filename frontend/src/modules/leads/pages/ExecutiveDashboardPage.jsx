import React, { useState } from 'react';
import { Briefcase, Wrench, MonitorSmartphone } from 'lucide-react';
import { ExecutiveComercial } from '../components/executive-dashboard/ExecutiveComercial';
import { ExecutivePostVenta } from '../components/executive-dashboard/ExecutivePostVenta';
import { ExecutiveDigital } from '../components/executive-dashboard/ExecutiveDigital';

export const ExecutiveDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('comercial');
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const tabs = [
    { id: 'comercial', label: 'Área Comercial', icon: Briefcase },
    { id: 'postventa', label: 'Área Post Venta', icon: Wrench },
    { id: 'digital', label: 'Toyota Digital', icon: MonitorSmartphone },
  ];

  return (
    <div className="min-h-screen  p-6 font-sans">
      <div className="max-w-11/12 mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard Leads</h1>
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
            <label className="text-sm font-semibold text-slate-600 mr-3 ml-2">Mes:</label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex space-x-2 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-md transform scale-100'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <Icon className="mr-2" size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="animate-fadeIn">
          {activeTab === 'comercial' && <ExecutiveComercial month={selectedMonth} />}
          {activeTab === 'postventa' && <ExecutivePostVenta month={selectedMonth} />}
          {activeTab === 'digital' && <ExecutiveDigital month={selectedMonth} />} 
        </div>

      </div>
    </div>
  );
};