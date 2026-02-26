import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './DepartmentManager.css';

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
    try {
      const res = await authFetch('http://127.0.0.1:8000/api/departments');
      const data = await res.json();
      setDepartments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        await loadDepartments();
        setForm({
          number: '',
          block: '',
          bedrooms: '',
          bathrooms: '',
          area: '',
          status: 'active',
        });
        setEditingId(null);
        setShowForm(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (dept) => {
    setForm(dept);
    setEditingId(dept.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro?')) {
      try {
        await authFetch(`http://127.0.0.1:8000/api/departments/${id}`, {
          method: 'DELETE',
        });
        await loadDepartments();
      } catch (e) {
        console.error(e);
      }
    }
  };

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
        <form onSubmit={handleSubmit} className="dept-form">
          <input
            type="text"
            placeholder="Número (ej: 101)"
            value={form.number}
            onChange={e => setForm({ ...form, number: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Bloque (ej: A)"
            value={form.block}
            onChange={e => setForm({ ...form, block: e.target.value })}
          />
          <input
            type="number"
            placeholder="Recámaras"
            value={form.bedrooms}
            onChange={e => setForm({ ...form, bedrooms: e.target.value })}
          />
          <input
            type="number"
            placeholder="Baños"
            value={form.bathrooms}
            onChange={e => setForm({ ...form, bathrooms: e.target.value })}
          />
          <input
            type="number"
            placeholder="Área (m²)"
            value={form.area}
            onChange={e => setForm({ ...form, area: e.target.value })}
          />
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
          <button type="submit">{editingId ? 'Actualizar' : 'Crear'}</button>
        </form>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
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
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(dept)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(dept.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
