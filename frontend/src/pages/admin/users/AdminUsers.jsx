import { useState, useEffect } from 'react';
import { Plus, Search, Shield, User as UserIcon, Building2, Edit2, Trash2, X } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editingId, setEditingId] = useState(null);
  
  const [cinemas, setCinemas] = useState([]);
  const [filterCinema, setFilterCinema] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    cinemaId: ''
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'staff', cinemaId: '' });
    setEditingId(null);
  };

  const fetchCinemas = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/cinemas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCinemas(Array.isArray(data) ? data : (data.cinemas || []));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filterRole !== 'all' ? `http://localhost:5000/api/users?role=${filterRole}` : 'http://localhost:5000/api/users';
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCinemas();
  }, [filterRole]);

  const handleEdit = (user) => {
    setEditingId(user._id);
    setFormData({
      name: user.profiles?.[0]?.name || '',
      email: user.email,
      password: '',
      role: user.role,
      cinemaId: user.cinemaId?._id || ''
    });
    setShowAddUser(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi khi xóa user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const isEdit = !!editingId;
      const url = isEdit 
        ? `http://localhost:5000/api/users/${editingId}` 
        : 'http://localhost:5000/api/users';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = { ...formData };
      if (isEdit && !payload.password) delete payload.password;
      if (!payload.cinemaId) payload.cinemaId = null;

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchUsers();
        setShowAddUser(false);
        resetForm();
      } else {
        const data = await res.json();
        alert(data.message || (isEdit ? 'Lỗi khi cập nhật user' : 'Lỗi khi tạo user'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) || (u.profiles[0]?.name.toLowerCase().includes(search.toLowerCase()));
    const matchCinema = filterCinema === 'all' ? true : (u.cinemaId && u.cinemaId._id === filterCinema);
    return matchSearch && matchCinema;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff & Users</h1>
          <p className="text-on-surface-variant mt-1">Manage system accounts and access roles.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setShowAddUser(true);
          }}
          className="bg-primary-container text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-container/80 transition-all flex items-center gap-2 shadow-lg hover:shadow-primary-container/50"
        >
          <Plus size={20} /> Add Account
        </button>
      </div>

      <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between bg-black/20">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
            <input 
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-on-surface outline-none focus:border-primary-container transition-colors"
            />
          </div>
          
          <div className="flex gap-4 items-center">
            {/* Cinema Filter */}
            <select
              value={filterCinema}
              onChange={(e) => setFilterCinema(e.target.value)}
              className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm text-on-surface outline-none focus:border-primary-container appearance-none cursor-pointer hidden sm:block"
            >
              <option value="all">All Cinemas</option>
              {cinemas.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
            {['all', 'user', 'staff', 'admin'].map(role => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filterRole === role 
                    ? 'bg-surface-container-highest text-white shadow-sm' 
                    : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="p-4 font-semibold text-on-surface-variant">User</th>
                <th className="p-4 font-semibold text-on-surface-variant">Role</th>
                <th className="p-4 font-semibold text-on-surface-variant">Assigned Cinema</th>
                <th className="p-4 font-semibold text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-white/10 overflow-hidden">
                        <img src={user.profiles[0]?.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold">{user.profiles[0]?.name}</div>
                        <div className="text-sm text-on-surface-variant">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      user.role === 'staff' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-white/10 text-on-surface-variant border border-white/5'
                    }`}>
                      {user.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="p-4 text-on-surface-variant">
                    {user.cinemaId ? (
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-primary-container" />
                        <span>{user.cinemaId.name}</span>
                      </div>
                    ) : (
                      <span className="text-white/30 italic">Not Assigned</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 bg-black/30 hover:bg-white/10 rounded-lg text-blue-400 transition-colors cursor-pointer" 
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="p-2 bg-black/30 hover:bg-red-500/20 rounded-lg text-primary-container transition-colors cursor-pointer" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-on-surface-variant">No accounts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handleSubmitUser} className="bg-surface-container-high rounded-3xl border border-white/10 w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-on-surface">{editingId ? 'Edit Account' : 'Add Account'}</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  {editingId ? 'Update account details and role assignment.' : 'Create a new staff or admin account.'}
                </p>
              </div>
              <button type="button" onClick={() => { setShowAddUser(false); resetForm(); }} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">Full Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">Email Address</label>
                <input 
                  type="email" required
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">
                  {editingId ? 'New Password (bỏ trống nếu không đổi)' : 'Temporary Password'}
                </label>
                <input 
                  type="password" 
                  required={!editingId}
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary-container"
                  placeholder={editingId ? 'Để trống nếu giữ nguyên mật khẩu cũ' : ''}
                />
              </div>
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">Account Role</label>
                <select 
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary-container appearance-none"
                >
                  <option value="staff" className="bg-surface-container">Staff (Cinema Manager / POS)</option>
                  <option value="admin" className="bg-surface-container">Admin (Full Access)</option>
                  <option value="user" className="bg-surface-container">Regular User</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">Assigned Cinema (optional)</label>
                <select 
                  value={formData.cinemaId} 
                  onChange={e => setFormData({...formData, cinemaId: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary-container appearance-none"
                >
                  <option value="" className="bg-surface-container">— Not Assigned —</option>
                  {cinemas.map(c => (
                    <option key={c._id} value={c._id} className="bg-surface-container">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
              <button type="button" onClick={() => { setShowAddUser(false); resetForm(); }} className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-primary-container text-white hover:bg-primary-container/80 transition-all shadow-lg">
                {editingId ? 'Update Account' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
