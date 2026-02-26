import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatDepartamento from './ChatDepartamento';
import DepartmentManager from './DepartmentManager';

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('chat');

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <button
          className={tab === 'chat' ? 'active' : ''}
          onClick={() => setTab('chat')}
        >
          💬 Chat
        </button>
        <button
          className={tab === 'departments' ? 'active' : ''}
          onClick={() => setTab('departments')}
        >
          🏢 Departamentos
        </button>
      </nav>

      <div className="dashboard-content">
        {tab === 'chat' && <ChatDepartamento />}
        {tab === 'departments' && <DepartmentManager />}
      </div>
    </div>
  );
}
