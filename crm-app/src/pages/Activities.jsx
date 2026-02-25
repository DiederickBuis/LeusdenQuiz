import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Plus, Search, X, Pencil, Trash2, Phone, Mail, Calendar, FileText, CheckSquare } from 'lucide-react'

const TYPES = ['call', 'email', 'meeting', 'note', 'task']
const TYPE_LABELS = { call: 'Telefoongesprek', email: 'E-mail', meeting: 'Vergadering', note: 'Notitie', task: 'Taak' }
const TYPE_ICONS = { call: Phone, email: Mail, meeting: Calendar, note: FileText, task: CheckSquare }

export default function Activities() {
  const [activities, setActivities] = useState([])
  const [contacts, setContacts] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    type: 'call', subject: '', description: '', contact_id: '', deal_id: '', due_date: '', completed: false
  })

  useEffect(() => { fetchActivities(); fetchContacts(); fetchDeals() }, [])

  async function fetchActivities() {
    setLoading(true)
    const { data } = await supabase
      .from('activities')
      .select('*, contacts(first_name, last_name), deals(title)')
      .order('created_at', { ascending: false })
    setActivities(data || [])
    setLoading(false)
  }

  async function fetchContacts() {
    const { data } = await supabase.from('contacts').select('id, first_name, last_name').order('first_name')
    setContacts(data || [])
  }

  async function fetchDeals() {
    const { data } = await supabase.from('deals').select('id, title').order('title')
    setDeals(data || [])
  }

  function openCreate() {
    setEditing(null)
    setForm({ type: 'call', subject: '', description: '', contact_id: '', deal_id: '', due_date: '', completed: false })
    setShowModal(true)
  }

  function openEdit(activity) {
    setEditing(activity)
    setForm({
      type: activity.type,
      subject: activity.subject,
      description: activity.description || '',
      contact_id: activity.contact_id || '',
      deal_id: activity.deal_id || '',
      due_date: activity.due_date ? activity.due_date.slice(0, 16) : '',
      completed: activity.completed || false,
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      contact_id: form.contact_id || null,
      deal_id: form.deal_id || null,
      due_date: form.due_date || null,
    }
    if (editing) {
      await supabase.from('activities').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('activities').insert(payload)
    }
    setShowModal(false)
    fetchActivities()
  }

  async function handleDelete(id) {
    if (!confirm('Weet je zeker dat je deze activiteit wilt verwijderen?')) return
    await supabase.from('activities').delete().eq('id', id)
    fetchActivities()
  }

  async function toggleComplete(activity) {
    await supabase.from('activities').update({ completed: !activity.completed }).eq('id', activity.id)
    fetchActivities()
  }

  const filtered = activities.filter(a => {
    const q = search.toLowerCase()
    return (
      a.subject.toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q) ||
      (a.contacts ? `${a.contacts.first_name} ${a.contacts.last_name}` : '').toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="page-header">
        <h2>Activiteiten</h2>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search size={16} />
            <input placeholder="Zoeken..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Nieuwe Activiteit
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><p>Geen activiteiten gevonden</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Type</th>
                  <th>Onderwerp</th>
                  <th>Contact</th>
                  <th>Deal</th>
                  <th>Datum</th>
                  <th style={{ width: 100 }}>Acties</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const Icon = TYPE_ICONS[a.type] || Mail
                  return (
                    <tr key={a.id} style={{ opacity: a.completed ? 0.5 : 1 }}>
                      <td onClick={e => { e.stopPropagation(); toggleComplete(a) }}>
                        <input type="checkbox" checked={a.completed} readOnly style={{ cursor: 'pointer' }} />
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Icon size={14} />
                          {TYPE_LABELS[a.type]}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, textDecoration: a.completed ? 'line-through' : 'none' }}>{a.subject}</td>
                      <td>{a.contacts ? `${a.contacts.first_name} ${a.contacts.last_name}` : '-'}</td>
                      <td>{a.deals?.title || '-'}</td>
                      <td>{a.due_date ? new Date(a.due_date).toLocaleDateString('nl-NL') : '-'}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="btn btn-sm btn-secondary" style={{ marginRight: 4 }} onClick={() => openEdit(a)}><Pencil size={14} /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Activiteit Bewerken' : 'Nieuwe Activiteit'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Onderwerp *</label>
                    <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Beschrijving</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact</label>
                    <select value={form.contact_id} onChange={e => setForm({ ...form, contact_id: e.target.value })}>
                      <option value="">-- Selecteer --</option>
                      {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Deal</label>
                    <select value={form.deal_id} onChange={e => setForm({ ...form, deal_id: e.target.value })}>
                      <option value="">-- Selecteer --</option>
                      {deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Datum</label>
                    <input type="datetime-local" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.completed} onChange={e => setForm({ ...form, completed: e.target.checked })} />
                      Afgerond
                    </label>
                  </div>
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
