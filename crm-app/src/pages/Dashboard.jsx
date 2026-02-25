import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Users, Building2, Handshake, TrendingUp, Phone, Mail, Calendar } from 'lucide-react'

const STAGES = ['lead', 'contact', 'proposal', 'negotiation', 'won', 'lost']
const STAGE_LABELS = {
  lead: 'Lead',
  contact: 'Contact',
  proposal: 'Offerte',
  negotiation: 'Onderhandeling',
  won: 'Gewonnen',
  lost: 'Verloren',
}

export default function Dashboard() {
  const [stats, setStats] = useState({ contacts: 0, companies: 0, deals: 0, totalValue: 0 })
  const [recentDeals, setRecentDeals] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [pipelineDeals, setPipelineDeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [contactsRes, companiesRes, dealsRes, activitiesRes] = await Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase.from('deals').select('*, contacts(first_name, last_name), companies(name)').order('created_at', { ascending: false }),
      supabase.from('activities').select('*, contacts(first_name, last_name)').order('created_at', { ascending: false }).limit(5),
    ])

    const deals = dealsRes.data || []
    const wonDeals = deals.filter(d => d.stage === 'won')
    const totalValue = wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0)

    setStats({
      contacts: contactsRes.count || 0,
      companies: companiesRes.count || 0,
      deals: deals.length,
      totalValue,
    })

    setRecentDeals(deals.slice(0, 5))
    setPipelineDeals(deals)
    setRecentActivities(activitiesRes.data || [])
    setLoading(false)
  }

  function formatCurrency(val) {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val)
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div><p>Laden...</p></div>
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label"><Users size={14} style={{display:'inline', marginRight:4}} />Contacten</div>
          <div className="stat-value">{stats.contacts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Building2 size={14} style={{display:'inline', marginRight:4}} />Bedrijven</div>
          <div className="stat-value">{stats.companies}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Handshake size={14} style={{display:'inline', marginRight:4}} />Deals</div>
          <div className="stat-value">{stats.deals}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><TrendingUp size={14} style={{display:'inline', marginRight:4}} />Gewonnen Omzet</div>
          <div className="stat-value">{formatCurrency(stats.totalValue)}</div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', fontWeight: 600 }}>
          Deal Pipeline
        </div>
        <div style={{ padding: 16 }}>
          <div className="pipeline">
            {STAGES.filter(s => s !== 'lost').map(stage => {
              const stageDeals = pipelineDeals.filter(d => d.stage === stage)
              return (
                <div key={stage} className="pipeline-column">
                  <div className="pipeline-column-header">
                    {STAGE_LABELS[stage]}
                    <span className="count">{stageDeals.length}</span>
                  </div>
                  {stageDeals.map(deal => (
                    <div key={deal.id} className="pipeline-card">
                      <div className="deal-title">{deal.title}</div>
                      <div className="deal-company">{deal.companies?.name || '-'}</div>
                      <div className="deal-value">{formatCurrency(deal.value)}</div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', fontWeight: 600 }}>
          Recente Activiteiten
        </div>
        <div style={{ padding: '12px 20px' }}>
          {recentActivities.length === 0 ? (
            <div className="empty-state"><p>Geen activiteiten gevonden</p></div>
          ) : (
            recentActivities.map(act => {
              const IconMap = { call: Phone, email: Mail, meeting: Calendar, note: Mail, task: Mail }
              const Icon = IconMap[act.type] || Mail
              return (
                <div key={act.id} className="activity-item">
                  <div className={`activity-icon ${act.type}`}>
                    <Icon size={16} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-subject">{act.subject}</div>
                    <div className="activity-meta">
                      {act.contacts ? `${act.contacts.first_name} ${act.contacts.last_name}` : ''}
                      {act.due_date ? ` • ${new Date(act.due_date).toLocaleDateString('nl-NL')}` : ''}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
