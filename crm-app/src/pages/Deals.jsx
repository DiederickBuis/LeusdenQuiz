import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Plus, Search, X, Pencil, Trash2 } from 'lucide-react'

const STAGES = ['lead', 'contact', 'proposal', 'negotiation', 'won', 'lost']
const STAGE_LABELS = {
  lead: 'Lead',
  contact: 'Contact',
  proposal: 'Offerte',
  negotiation: 'Onderhandeling',
  won: 'Gewonnen',
  lost: 'Verloren',
}

export default function Deals() {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [view, setView] = useState('pipeline') // 'pipeline' or 'table'
  const [form, setForm] = useState({
    title: '', value: '', stage: 'lead', contact_id: '', company_id: '', expected_close_date: '', notes: ''
  })

  useEffect(() => { fetchDeals(); fetchContacts(); fetchCompanies() }, [])

  async function fetchDeals() {
    setLoading(true)
    const { data } = await supabase
      .from('deals')
      .select('*, contacts(first_name, last_name), companies(name)')
      .order('created_at', { ascending: false })
    setDeals(data || [])
    setLoading(false)
  }

  async function fetchContacts() {
    const { data } = await supabase.from('contacts').select('id, first_name, last_name').order('first_name')
    setContacts(data || [])
  }

  async function fetchCompanies() {
    const { data } = await supabase.from('companies').select('id, name').order('name')
    setCompanies(data || [])
  }

  function openCreate() {
    setEditing(null)
    setForm({ title: '', value: '', stage: 'lead', contact_id: '', company_id: '', expected_close_date: '', notes: '' })
    setShowModal(true)
  }

  function openEdit(deal) {
    setEditing(deal)
    setForm({
      title: deal.title,
      value: deal.value || '',
      stage: deal.stage,
      contact_id: deal.contact_id || '',
      company_id: deal.company_id || '',
      expected_close_date: deal.expected_close_date || '',
      notes: deal.notes || '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      value: form.value || 0,
      contact_id: form.contact_id || null,
      company_id: form.company_id || null,
      expected_close_date: form.expected_close_date || null,
    }
    if (editing) {
      await supabase.from('deals').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('deals').insert(payload)
    }
    setShowModal(false)
    fetchDeals()
  }

  async function handleDelete(id) {
    if (!confirm('Weet je zeker dat je deze deal wilt verwijderen?')) return
    await supabase.from('deals').delete().eq('id', id)
    fetchDeals()
  }

  function formatCurrency(val) {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val)
  }

  const filtered = deals.filter(d => {
    const q = search.toLowerCase()
    return (
      d.title.toLowerCase().includes(q) ||
      (d.companies?.name || '').toLowerCase().includes(q) ||
      (d.contacts ? `${d.contacts.first_name} ${d.contacts.last_name}` : '').toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="page-header">
        <h2>Deals</h2>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search size={16} />
            <input placeholder="Zoeken..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className={`btn ${view === 'pipeline' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('pipeline')}>Pipeline</button>
          <button className={`btn ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('table')}>Tabel</button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Nieuwe Deal
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : view === 'pipeline' ? (
        <div className="pipeline">
          {STAGES.map(stage => {
            const stageDeals = filtered.filter(d => d.stage === stage)
            const stageTotal = stageDeals.reduce((sum, d) => sum + Number(d.value || 0), 0)
            return (
              <div key={stage} className="pipeline-column">
                <div className="pipeline-column-header">
                  {STAGE_LABELS[stage]}
                  <span className="count">{stageDeals.length}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: 8 }}>
                  {formatCurrency(stageTotal)}
                </div>
                {stageDeals.map(deal => (
                  <div key={deal.id} className="pipeline-card" onClick={() => openEdit(deal)}>
                    <div className="deal-title">{deal.title}</div>
                    <div className="deal-company">
                      {deal.companies?.name || '-'}
                      {deal.contacts ? ` • ${deal.contacts.first_name} ${deal.contacts.last_name}` : ''}
                    </div>
                    <div className="deal-value">{formatCurrency(deal.value)}</div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            {filtered.length === 0 ? (
              <div className="empty-state"><p>Geen deals gevonden</p></div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Titel</th>
                    <th>Waarde</th>
                    <th>Fase</th>
                    <th>Contact</th>
                    <th>Bedrijf</th>
                    <th>Sluitdatum</th>
                    <th style={{ width: 100 }}>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id} onClick={() => openEdit(d)}>
                      <td style={{ fontWeight: 500 }}>{d.title}</td>
                      <td>{formatCurrency(d.value)}</td>
                      <td><span className={`badge badge-${d.stage}`}>{STAGE_LABELS[d.stage]}</span></td>
                      <td>{d.contacts ? `${d.contacts.first_name} ${d.contacts.last_name}` : '-'}</td>
                      <td>{d.companies?.name || '-'}</td>
                      <td>{d.expected_close_date ? new Date(d.expected_close_date).toLocaleDateString('nl-NL') : '-'}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="btn btn-sm btn-secondary" style={{ marginRight: 4 }} onClick={() => openEdit(d)}><Pencil size={14} /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d.id)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Deal Bewerken' : 'Nieuwe Deal'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Titel *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Waarde (€)</label>
                    <input type="number" step="0.01" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Fase</label>
                    <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
                      {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                    </select>
                  </div>
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
                    <label>Bedrijf</label>
                    <select value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })}>
                      <option value="">-- Selecteer --</option>
                      {companies.map(co => <option key={co.id} value={co.id}>{co.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Verwachte sluitdatum</label>
                  <input type="date" value={form.expected_close_date} onChange={e => setForm({ ...form, expected_close_date: e.target.value })} />
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
