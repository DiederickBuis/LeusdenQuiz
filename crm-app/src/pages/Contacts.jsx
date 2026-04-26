import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Plus, Search, X, Pencil, Trash2 } from 'lucide-react'

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', company_id: '', job_title: '', notes: '' })

  useEffect(() => { fetchContacts(); fetchCompanies() }, [])

  async function fetchContacts() {
    setLoading(true)
    const { data } = await supabase
      .from('contacts')
      .select('*, companies(name)')
      .order('created_at', { ascending: false })
    setContacts(data || [])
    setLoading(false)
  }

  async function fetchCompanies() {
    const { data } = await supabase.from('companies').select('id, name').order('name')
    setCompanies(data || [])
  }

  function openCreate() {
    setEditing(null)
    setForm({ first_name: '', last_name: '', email: '', phone: '', company_id: '', job_title: '', notes: '' })
    setShowModal(true)
  }

  function openEdit(contact) {
    setEditing(contact)
    setForm({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email || '',
      phone: contact.phone || '',
      company_id: contact.company_id || '',
      job_title: contact.job_title || '',
      notes: contact.notes || '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form, company_id: form.company_id || null }
    if (editing) {
      await supabase.from('contacts').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('contacts').insert(payload)
    }
    setShowModal(false)
    fetchContacts()
  }

  async function handleDelete(id) {
    if (!confirm('Weet je zeker dat je dit contact wilt verwijderen?')) return
    await supabase.from('contacts').delete().eq('id', id)
    fetchContacts()
  }

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase()
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.companies?.name || '').toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="page-header">
        <h2>Contacten</h2>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search size={16} />
            <input placeholder="Zoeken..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Nieuw Contact
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><p>Geen contacten gevonden</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>E-mail</th>
                  <th>Telefoon</th>
                  <th>Bedrijf</th>
                  <th>Functie</th>
                  <th style={{ width: 100 }}>Acties</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} onClick={() => openEdit(c)}>
                    <td style={{ fontWeight: 500 }}>{c.first_name} {c.last_name}</td>
                    <td>{c.email || '-'}</td>
                    <td>{c.phone || '-'}</td>
                    <td>{c.companies?.name || '-'}</td>
                    <td>{c.job_title || '-'}</td>
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
              <h3>{editing ? 'Contact Bewerken' : 'Nieuw Contact'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Voornaam *</label>
                    <input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Achternaam *</label>
                    <input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
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
                <div className="form-row">
                  <div className="form-group">
                    <label>Bedrijf</label>
                    <select value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })}>
                      <option value="">-- Selecteer --</option>
                      {companies.map(co => <option key={co.id} value={co.id}>{co.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Functie</label>
                    <input value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} />
                  </div>
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
