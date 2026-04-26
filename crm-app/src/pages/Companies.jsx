import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Plus, Search, X, Pencil, Trash2 } from 'lucide-react'

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', industry: '', website: '', phone: '', email: '', address: '', notes: '' })

  useEffect(() => { fetchCompanies() }, [])

  async function fetchCompanies() {
    setLoading(true)
    const { data } = await supabase
      .from('companies')
      .select('*, contacts(id)')
      .order('created_at', { ascending: false })
    setCompanies(data || [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: '', industry: '', website: '', phone: '', email: '', address: '', notes: '' })
    setShowModal(true)
  }

  function openEdit(company) {
    setEditing(company)
    setForm({
      name: company.name,
      industry: company.industry || '',
      website: company.website || '',
      phone: company.phone || '',
      email: company.email || '',
      address: company.address || '',
      notes: company.notes || '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editing) {
      await supabase.from('companies').update(form).eq('id', editing.id)
    } else {
      await supabase.from('companies').insert(form)
    }
    setShowModal(false)
    fetchCompanies()
  }

  async function handleDelete(id) {
    if (!confirm('Weet je zeker dat je dit bedrijf wilt verwijderen?')) return
    await supabase.from('companies').delete().eq('id', id)
    fetchCompanies()
  }

  const filtered = companies.filter(c => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.industry || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="page-header">
        <h2>Bedrijven</h2>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search size={16} />
            <input placeholder="Zoeken..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Nieuw Bedrijf
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><p>Geen bedrijven gevonden</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>Branche</th>
                  <th>E-mail</th>
                  <th>Telefoon</th>
                  <th>Contacten</th>
                  <th style={{ width: 100 }}>Acties</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} onClick={() => openEdit(c)}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.industry || '-'}</td>
                    <td>{c.email || '-'}</td>
                    <td>{c.phone || '-'}</td>
                    <td>{c.contacts?.length || 0}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-sm btn-secondary" style={{ marginRight: 4 }} onClick={() => openEdit(c)}><Pencil size={14} /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Bedrijf Bewerken' : 'Nieuw Bedrijf'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Bedrijfsnaam *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Branche</label>
                    <input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>E-mail</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Telefoon</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Adres</label>
                  <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Notities</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">{editing ? 'Opslaan' : 'Toevoegen'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuleren</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
