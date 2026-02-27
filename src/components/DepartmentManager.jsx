import { useState, useEffect, useTransition } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './DepartmentManager.css';
import TransitionAlert from './TransitionAlert';

export default function DepartmentManager() {
  const { authFetch } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    number: '',
    block: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    status: 'active',
  });

  const loadDepartments = async () => {
    setLoading(true);
    setActionLoading('load');
    try {
      const res = await authFetch('http://127.0.0.1:8000/api/departments');
      const data = await res.json();
      startTransition(() => setDepartments(data));
    } catch (e) {
      console.error(e);
      setAlert({ show: true, message: 'Error cargando departamentos', type: 'error' });
    } finally {
      setLoading(false);
      setActionLoading(null);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('submit');
    try {
      const body = JSON.stringify(form);
      let res;
      if (editingId) {
        res = await authFetch(
          `http://127.0.0.1:8000/api/departments/${editingId}`,
          { method: 'PUT', body }
        );
      } else {
        res = await authFetch('http://127.0.0.1:8000/api/departments', {
          method: 'POST',
          body,
        });
      }
      if (res.ok) {
        const text = editingId ? 'Departamento actualizado' : 'Departamento creado';
        await loadDepartments();
        setForm({ number: '', block: '', bedrooms: '', bathrooms: '', area: '', status: 'active' });
        setEditingId(null);
        setShowForm(false);
        setAlert({ show: true, message: text, type: 'success' });
      } else {
        const err = await res.text();
        setAlert({ show: true, message: err || 'Error en la petición', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      setAlert({ show: true, message: 'Error en la petición', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (dept) => {
    setForm(dept);
    setEditingId(dept.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro?')) {
      setActionLoading(`delete-${id}`);
      try {
        const res = await authFetch(`http://127.0.0.1:8000/api/departments/${id}`, { method: 'DELETE' });
        if (res.ok) {
          await loadDepartments();
          setAlert({ show: true, message: 'Departamento eliminado', type: 'success' });
        } else {
          setAlert({ show: true, message: 'No se pudo eliminar', type: 'error' });
        }
      } catch (e) {
        console.error(e);
        setAlert({ show: true, message: 'Error en la petición', type: 'error' });
      } finally {
        setActionLoading(null);
      }
    }
  };

  // React transition hook to mark non-urgent updates
  const [isPending, startTransition] = useTransition();
  const [actionLoading, setActionLoading] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  return (
    <div className="department-manager">
      <h2>Administrar Departamentos</h2>
      <button
        className="btn-primary"
        onClick={() => {
          setShowForm(!showForm);
          if (!showForm) {
            setEditingId(null);
            setForm({
              number: '',
              block: '',
              bedrooms: '',
              bathrooms: '',
              area: '',
              status: 'active',
            });
          }
        }}
      >
        {showForm ? 'Cerrar' : 'Nuevo Departamento'}
      </button>

      {showForm && (
        <div className="dept-form-wrapper">
          <form onSubmit={handleSubmit} className="dept-form">
          <input
            type="text"
            placeholder="Número (ej: 101)"
            value={form.number}
            onChange={e => setForm({ ...form, number: e.target.value })}
            required
            disabled={actionLoading === 'submit'}
          />
          <input
            type="text"
            placeholder="Bloque (ej: A)"
            value={form.block}
            onChange={e => setForm({ ...form, block: e.target.value })}
            disabled={actionLoading === 'submit'}
          />
          <input
            type="number"
            placeholder="Recámaras"
            value={form.bedrooms}
            onChange={e => setForm({ ...form, bedrooms: e.target.value })}
            disabled={actionLoading === 'submit'}
          />
          <input
            type="number"
            placeholder="Baños"
            value={form.bathrooms}
            onChange={e => setForm({ ...form, bathrooms: e.target.value })}
            disabled={actionLoading === 'submit'}
          />
          <input
            type="number"
            placeholder="Área (m²)"
            value={form.area}
            onChange={e => setForm({ ...form, area: e.target.value })}
            disabled={actionLoading === 'submit'}
          />
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            disabled={actionLoading === 'submit'}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
          <button type="submit" disabled={actionLoading === 'submit'}>
            {actionLoading === 'submit' ? (editingId ? 'Actualizando...' : 'Creando...') : (editingId ? 'Actualizar' : 'Crear')}
          </button>
        </form>
        {actionLoading === 'submit' && <div className="overlay">Procesando...</div>}
        </div>
      )}

      <div className="table-container">
        <table className="dept-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Bloque</th>
              <th>Recámaras</th>
              <th>Baños</th>
              <th>Área (m²)</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept.id}>
                <td>{dept.number}</td>
                <td>{dept.block || '-'}</td>
                <td>{dept.bedrooms || '-'}</td>
                <td>{dept.bathrooms || '-'}</td>
                <td>{dept.area || '-'}</td>
                <td>{dept.status}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(dept)} disabled={actionLoading !== null}>
                    {actionLoading === 'submit' ? '...' : 'Editar'}
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(dept.id)} disabled={!!actionLoading}>
                    {actionLoading === `delete-${dept.id}` ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="overlay">Cargando departamentos...</div>}
      </div>

      <TransitionAlert
        show={alert.show}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, show: false })}
      />
    </div>
  );
}
