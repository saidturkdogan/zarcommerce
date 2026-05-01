import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings,
  LogOut, RefreshCw, Search, Lock, User, TrendingUp, Tag,
  CircleDollarSign, Pencil, Trash2, Plus, X, CheckCircle2,
  Clock, XCircle, Truck, ChevronDown
} from 'lucide-react'

type Product = { id: number; name: string; price: number; category: string }
type Order = { id: number; orderNumber: string; customer: string; email: string; date: string; total: number; status: string; items: number }
type Customer = { id: number; firstName: string; lastName: string; email: string; role: string }

const USER_API = import.meta.env.VITE_USER_API_BASE_URL || 'http://localhost:8081'
const PRODUCT_API = import.meta.env.VITE_PRODUCT_API_BASE_URL || 'http://localhost:8082'
const ORDER_API = 'http://localhost:8084'
const TK = 'zarcommerce_admin_token'
const UK = 'zarcommerce_admin_user'

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  shipped: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
}

function hdrs() {
  const t = localStorage.getItem(TK)
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }
}

export default function App() {
  const [auth, setAuth] = useState(() => !!localStorage.getItem(TK))
  const [uname, setUname] = useState('admin')
  const [pwd, setPwd] = useState('')
  const [loginErr, setLoginErr] = useState<string | null>(null)
  const [cu, setCu] = useState(() => localStorage.getItem(UK) || 'admin')
  const [tab, setTab] = useState('Dashboard')

  // Products
  const [products, setProducts] = useState<Product[]>([])
  const [prodsLoading, setProdsLoading] = useState(false)
  const [prodsErr, setProdsErr] = useState<string | null>(null)
  const [q, setQ] = useState('')

  // Orders
  const [orders, setOrders] = useState<Order[]>([])
  const [ordsLoading, setOrdsLoading] = useState(false)

  // Customers
  const [customers, setCustomers] = useState<Customer[]>([])
  const [custsLoading, setCustsLoading] = useState(false)

  // Edit modal
  const [editing, setEditing] = useState<Product | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [delTarget, setDelTarget] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', price: '', category: '' })
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)
  const [ordFilter, setOrdFilter] = useState('all')

  const loadProducts = async () => {
    setProdsLoading(true)
    setProdsErr(null)
    try {
      const t = localStorage.getItem(TK)
      const r = await fetch(`${PRODUCT_API}/api/v1/products`, { headers: t ? { Authorization: `Bearer ${t}` } : {} })
      if (!r.ok) throw new Error(`API ${r.status}`)
      setProducts(await r.json())
    } catch (e) {
      setProdsErr(e instanceof Error ? e.message : 'Error')
    } finally { setProdsLoading(false) }
  }

  const loadOrders = async () => {
    setOrdsLoading(true)
    try {
      const r = await fetch(`${ORDER_API}/api/v1/orders`)
      if (r.ok) setOrders(await r.json())
    } catch { /* mock data already set in backend */ } finally { setOrdsLoading(false) }
  }

  const loadCustomers = async () => {
    setCustsLoading(true)
    try {
      const r = await fetch(`${USER_API}/api/v1/users`)
      if (r.ok) setCustomers(await r.json())
    } catch { /* */ } finally { setCustsLoading(false) }
  }

  useEffect(() => { if (auth) { loadProducts(); loadOrders(); loadCustomers() } }, [auth])

  const totalVal = useMemo(() => products.reduce((a, p) => a + p.price, 0), [products])
  const catCount = useMemo(() => new Set(products.map(p => p.category)).size, [products])
  const avgPrice = useMemo(() => products.length ? totalVal / products.length : 0, [products, totalVal])
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase()
    return !n ? products : products.filter(p => p.name.toLowerCase().includes(n) || p.category.toLowerCase().includes(n))
  }, [products, q])

  const filteredOrders = useMemo(() => {
    if (ordFilter === 'all') return orders
    return orders.filter(o => o.status === ordFilter)
  }, [orders, ordFilter])

  const orderStats = useMemo(() => ({
    total: orders.length,
    completed: orders.filter(o => o.status === 'completed').length,
    pending: orders.filter(o => o.status === 'pending').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + o.total, 0),
  }), [orders])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const r = await fetch(`${USER_API}/api/v1/auth/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: uname, password: pwd }),
      })
      if (!r.ok) throw new Error('Invalid credentials')
      const d = await r.json()
      localStorage.setItem(TK, d.token)
      localStorage.setItem(UK, d.username)
      setCu(d.username)
      setAuth(true)
      setLoginErr(null)
      setPwd('')
    } catch (e) {
      setLoginErr(e instanceof Error ? e.message : 'Login failed')
    }
  }

  const logout = () => {
    localStorage.removeItem(TK); localStorage.removeItem(UK)
    setAuth(false); setProducts([]); setOrders([]); setCustomers([])
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({ name: p.name, price: p.price.toString(), category: p.category })
    setSaveErr(null)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', price: '', category: '' })
    setSaveErr(null)
    setShowCreate(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setSaveErr(null)
    const payload = { name: form.name, price: parseFloat(form.price), category: form.category }
    try {
      const url = editing ? `${PRODUCT_API}/api/v1/products/${editing.id}` : `${PRODUCT_API}/api/v1/products`
      const r = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: hdrs(), body: JSON.stringify(payload) })
      if (!r.ok) { const t = await r.text(); throw new Error(t || `Error ${r.status}`) }
      await loadProducts()
      setEditing(null); setShowCreate(false)
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!delTarget) return
    setSaving(true)
    try {
      const r = await fetch(`${PRODUCT_API}/api/v1/products/${delTarget.id}`, { method: 'DELETE', headers: hdrs() })
      if (!r.ok) throw new Error(`Error ${r.status}`)
      await loadProducts()
      setDelTarget(null)
    } catch (e) {
      setProdsErr(e instanceof Error ? e.message : 'Delete failed')
    } finally { setSaving(false) }
  }

  if (!auth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">ZarCommerce</h1>
            <p className="text-gray-500 text-sm mt-1">Admin Panel</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
              <input className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" value={uname} onChange={e => setUname(e.target.value)} placeholder="admin" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input type="password" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" />
            </div>
            {loginErr && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs text-center">{loginErr}</div>}
            <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm">Sign In</button>
          </div>
        </form>
      </div>
    )
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Products', icon: Package },
    { name: 'Orders', icon: ShoppingCart },
    { name: 'Customers', icon: Users },
    { name: 'Settings', icon: Settings },
  ]

  const Modal = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={() => { setEditing(null); setShowCreate(false); setDelTarget(null) }} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={() => { setEditing(null); setShowCreate(false); setDelTarget(null) }} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: products.length, icon: Package, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Categories', value: catCount, icon: Tag, color: 'bg-violet-50 text-violet-600' },
          { label: 'Orders', value: orders.length, icon: ShoppingCart, color: 'bg-amber-50 text-amber-600' },
          { label: 'Customers', value: customers.length, icon: Users, color: 'bg-emerald-50 text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">{s.label}</span>
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="w-4 h-4" /></div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-indigo-500" /><span className="text-sm font-semibold text-gray-700">Stock Value</span></div>
          <p className="text-2xl font-bold text-gray-900">{totalVal.toLocaleString('tr-TR')} <span className="text-sm font-normal text-gray-400">TRY</span></p>
          <p className="text-xs text-gray-400 mt-1">Avg: {avgPrice.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TRY</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3"><CircleDollarSign className="w-4 h-4 text-emerald-500" /><span className="text-sm font-semibold text-gray-700">Revenue</span></div>
          <p className="text-2xl font-bold text-gray-900">{orderStats.revenue.toLocaleString('tr-TR')} <span className="text-sm font-normal text-gray-400">TRY</span></p>
          <p className="text-xs text-gray-400 mt-1">From {orderStats.completed + orders.filter(o => o.status === 'shipped').length} orders</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3"><Package className="w-4 h-4 text-amber-500" /><span className="text-sm font-semibold text-gray-700">Quick Status</span></div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Pending Orders</span><span className="font-semibold text-amber-600">{orderStats.pending}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Completed</span><span className="font-semibold text-emerald-600">{orderStats.completed}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Cancelled</span><span className="font-semibold text-red-500">{orderStats.cancelled}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Recent Products</h3>
          <span className="text-xs text-gray-400">{products.length} items</span>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left"><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">ID</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Product</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Category</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Price</th></tr></thead>
          <tbody className="divide-y divide-gray-50">
            {products.slice(0, 5).map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">#{p.id.toString().padStart(4, '0')}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-5 py-3"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">{p.category}</span></td>
                <td className="px-5 py-3 text-right font-medium text-gray-700">{p.price.toLocaleString('tr-TR')} TRY</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">{products.length} products · {catCount} categories</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder-gray-400" />
        </div>
        {prodsErr && <div className="p-4 text-sm text-red-600 bg-red-50">{prodsErr}</div>}
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left"><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase w-20">ID</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Category</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Price</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-center w-24">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-50">
            {prodsLoading ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No products found</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">#{p.id.toString().padStart(4, '0')}</td>
                <td className="px-5 py-3.5 font-medium text-gray-800">{p.name}</td>
                <td className="px-5 py-3.5"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">{p.category}</span></td>
                <td className="px-5 py-3.5 text-right font-medium text-gray-700">{p.price.toLocaleString('tr-TR')} TRY</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDelTarget(p)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderOrders = () => {
    const statusFilters = ['all', 'pending', 'completed', 'shipped', 'cancelled']
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500">{orders.length} orders · {orderStats.revenue.toLocaleString('tr-TR')} TRY revenue</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[{ l: 'Total', v: orderStats.total, c: 'bg-gray-50' }, { l: 'Completed', v: orderStats.completed, c: 'bg-emerald-50' }, { l: 'Pending', v: orderStats.pending, c: 'bg-amber-50' }, { l: 'Shipped', v: orders.filter(o => o.status === 'shipped').length, c: 'bg-blue-50' }, { l: 'Cancelled', v: orderStats.cancelled, c: 'bg-red-50' }].map(s => (
            <div key={s.l} className={`${s.c} rounded-xl p-4 border border-gray-200`}>
              <p className="text-xs text-gray-500 font-medium">{s.l}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.v}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">All Orders</h3>
            <div className="flex gap-1">
              {statusFilters.map(s => (
                <button key={s} onClick={() => setOrdFilter(s)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${ordFilter === s ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
              ))}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left"><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Order</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Date</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Items</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-right">Total</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase text-center">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {ordsLoading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr> :
                filteredOrders.map(o => {
                  const s = statusStyle[o.status] || statusStyle.pending
                  return (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{o.orderNumber}</td>
                      <td className="px-5 py-3.5"><div><p className="font-medium text-gray-800">{o.customer}</p><p className="text-xs text-gray-400">{o.email}</p></div></td>
                      <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{new Date(o.date).toLocaleDateString('tr-TR')}</td>
                      <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{o.items}</td>
                      <td className="px-5 py-3.5 text-right font-medium text-gray-700">{o.total.toLocaleString('tr-TR')} TRY</td>
                      <td className="px-5 py-3.5 text-center"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${s.bg} ${s.text}`}><span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{o.status}</span></td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderCustomers = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Customers</h2>
        <p className="text-sm text-gray-500">{customers.length} registered users</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">All Customers</h3>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left"><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">ID</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Email</th><th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Role</th></tr></thead>
          <tbody className="divide-y divide-gray-50">
            {custsLoading ? <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr> :
              customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">#{c.id.toString().padStart(4, '0')}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">{c.firstName.charAt(0)}{c.lastName.charAt(0)}</div>
                      <span className="font-medium text-gray-800">{c.firstName} {c.lastName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{c.email}</td>
                  <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded text-xs font-medium ${c.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>{c.role}</span></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Admin account and system info</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">{cu.charAt(0).toUpperCase()}</div>
          <div><p className="font-semibold text-gray-900">{cu}</p><p className="text-sm text-gray-500">Administrator</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[{ l: 'Username', v: cu }, { l: 'Role', v: 'Super Admin' }, { l: 'Product API', v: PRODUCT_API }, { l: 'User API', v: USER_API }].map(i => (
            <div key={i.l} className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-400 uppercase mb-0.5">{i.l}</p><p className="text-sm font-medium text-gray-700 truncate">{i.v}</p></div>
          ))}
        </div>
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"><LogOut className="w-4 h-4" /> Sign Out</button>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (tab) {
      case 'Products': return renderProducts()
      case 'Orders': return renderOrders()
      case 'Customers': return renderCustomers()
      case 'Settings': return renderSettings()
      default: return renderDashboard()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Product Edit Modal */}
      {editing && (
        <Modal title="Edit Product">
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Name</label><input className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Price</label><input type="number" step="0.01" min="0" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Category</label><input className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required /></div>
            </div>
            {saveErr && <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-xs">{saveErr}</div>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Update'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Product Modal */}
      {showCreate && (
        <Modal title="Add Product">
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Name</label><input className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Price</label><input type="number" step="0.01" min="0" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Category</label><input className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required /></div>
            </div>
            {saveErr && <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-xs">{saveErr}</div>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {delTarget && (
        <Modal title="Delete Product">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-3"><Trash2 className="w-5 h-5" /></div>
            <p className="text-sm text-gray-600">Are you sure you want to delete <span className="font-semibold text-gray-900">&ldquo;{delTarget.name}&rdquo;</span>?</p>
            <p className="text-xs text-gray-400 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDelTarget(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleDelete} disabled={saving} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">{saving ? 'Deleting...' : 'Delete'}</button>
          </div>
        </Modal>
      )}

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">ZarCommerce</h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Menu</p>
          {navItems.map(item => {
            const active = tab === item.name
            return (
              <button key={item.name} onClick={() => setTab(item.name)}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                <item.icon className={`w-4 h-4 mr-3 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
                {item.name}
              </button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">{cu.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0"><p className="text-xs font-medium text-gray-700 truncate">{cu}</p><p className="text-[10px] text-gray-400">Admin</p></div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div><h1 className="text-lg font-semibold text-gray-900">{tab}</h1></div>
          <div className="flex items-center gap-2">
            <button onClick={() => { loadProducts(); loadOrders(); loadCustomers() }} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50" title="Logout"><LogOut className="w-4 h-4" /></button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-[1400px] mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
