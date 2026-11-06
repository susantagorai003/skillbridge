import { useState, useEffect } from 'react'
import {
  Users, Shield, CheckCircle, XCircle, Search, Filter,
  ShieldCheck, RefreshCw, UserCheck
} from 'lucide-react'
import api from '../../services/api'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Spinner from '../../components/common/Spinner'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const fetchUsers = () => {
    setLoading(true)
    let url = '/auth/users/'
    const params = new URLSearchParams()
    if (selectedRole) params.append('role', selectedRole)
    if (search) params.append('search', search)
    if (params.toString()) url += `?${params.toString()}`

    api.get(url)
      .then((res) => {
        if (res.data?.success) {
          setUsers(res.data.users || [])
        }
      })
      .catch((err) => {
        console.error('Failed to load users:', err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [selectedRole])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchUsers()
  }

  const toggleUserActive = async (userId, currentActive) => {
    const newActive = !currentActive
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: newActive } : u))
    )

    try {
      await api.patch(`/auth/users/${userId}/`, { is_active: newActive })
      setStatusMessage('User status updated in MongoDB.')
      setTimeout(() => setStatusMessage(''), 2000)
    } catch (err) {
      console.error('Error toggling active status:', err)
      fetchUsers()
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    )

    try {
      await api.patch(`/auth/users/${userId}/`, { role: newRole })
      setStatusMessage(`User role updated to ${newRole} in MongoDB.`)
      setTimeout(() => setStatusMessage(''), 2000)
    } catch (err) {
      console.error('Error changing role:', err)
      fetchUsers()
    }
  }

  const roleBadgeColors = {
    student: 'bg-teal/15 text-teal border-teal/30',
    company: 'bg-coral/15 text-coral-dark border-coral/30',
    faculty: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    tpo: 'bg-golden/20 text-golden-dark border-golden/40',
    admin: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Admin Portal', href: '/admin' }, { label: 'User Management' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-midnight tracking-tight">
            User Accounts & Role Permissions
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Dynamic user management connected to MongoDB collection. View, verify, deactivate, and assign permissions.
          </p>
        </div>

        {statusMessage && (
          <div className="px-3 py-1.5 rounded-xl bg-mint text-midnight font-bold text-xs border border-teal/30">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate or organization name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-midnight text-white text-xs font-bold rounded-xl hover:bg-slate-800"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-midnight focus:outline-none focus:border-teal"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="company">Companies</option>
            <option value="faculty">Faculty</option>
            <option value="tpo">TPOs</option>
            <option value="admin">Administrators</option>
          </select>

          <button
            onClick={fetchUsers}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">User / Organization</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-midnight text-sm">{u.name}</p>
                      <p className="text-slate-500 text-[11px]">{u.email}</p>
                    </td>

                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border capitalize focus:outline-none ${
                          roleBadgeColors[u.role] || 'bg-slate-100'
                        }`}
                      >
                        <option value="student">Student</option>
                        <option value="company">Company</option>
                        <option value="faculty">Faculty</option>
                        <option value="tpo">TPO</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-mint text-midnight' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.is_active ? <CheckCircle size={11} /> : <XCircle size={11} />}
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="p-4">
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal bg-teal/10 px-2 py-0.5 rounded-full border border-teal/20">
                          <ShieldCheck size={13} /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              await api.post(`/admin/users/${u.id}/approve/`, { action: 'approve' })
                              setStatusMessage(`Approved ${u.name}'s registration.`)
                              fetchUsers()
                              setTimeout(() => setStatusMessage(''), 3000)
                            } catch (err) {
                              alert('Approval failed.')
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal hover:bg-teal-dark text-midnight cursor-pointer shadow-sm transition-all"
                        >
                          Approve Account
                        </button>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleUserActive(u.id, u.is_active)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          u.is_active
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-teal hover:bg-mint/40'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No user accounts found matching this criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
