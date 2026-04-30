import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Product = {
  id: number
  name: string
  price: number
  category: string
}

type AdminLoginResponse = {
  token: string
  username: string
  email: string
  superAdmin: boolean
}

const USER_API_BASE_URL = import.meta.env.VITE_USER_API_BASE_URL || 'http://localhost:8081'
const PRODUCT_API_BASE_URL = import.meta.env.VITE_PRODUCT_API_BASE_URL || 'http://localhost:8082'
const AUTH_TOKEN_KEY = 'zarcommerce_admin_token'
const AUTH_USER_KEY = 'zarcommerce_admin_user'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem(AUTH_TOKEN_KEY)))
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem(AUTH_USER_KEY) || 'admin')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const totalStockValue = useMemo(
    () => products.reduce((acc, product) => acc + product.price, 0),
    [products]
  )

  const categoryCount = useMemo(
    () => new Set(products.map((product) => product.category)).size,
    [products]
  )
  const averagePrice = useMemo(
    () => (products.length ? totalStockValue / products.length : 0),
    [products, totalStockValue]
  )

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized)
    )
  }, [products, query])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      const response = await fetch(`${PRODUCT_API_BASE_URL}/api/v1/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const data = (await response.json()) as Product[]
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      void loadProducts()
    }
  }, [isAuthenticated])

  const handleLogin = async (event: { preventDefault: () => void }) => {
    event.preventDefault()
    try {
      const response = await fetch(`${USER_API_BASE_URL}/api/v1/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('Invalid admin credentials')
      }

      const data = (await response.json()) as AdminLoginResponse
      localStorage.setItem(AUTH_TOKEN_KEY, data.token)
      localStorage.setItem(AUTH_USER_KEY, data.username)
      setCurrentUser(data.username)
      setIsAuthenticated(true)
      setLoginError(null)
      setPassword('')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    setIsAuthenticated(false)
    setUsername('admin')
    setPassword('')
    setProducts([])
    setQuery('')
  }

  if (!isAuthenticated) {
    return (
      <main className="auth-page">
        <form className="auth-card" onSubmit={handleLogin}>
          <h1>ZarCommerce Admin Login</h1>
          <p className="auth-hint">Default credentials: admin / Admin123!</p>
          <label className="input-group">
            <span>Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin"
              required
            />
          </label>
          <label className="input-group">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              required
            />
          </label>
          {loginError && <p className="error-text">{loginError}</p>}
          <button type="submit" className="primary-btn">
            Sign in
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand">ZarCommerce Admin</div>
        <nav className="nav-list">
          <button type="button" className="nav-item active">
            Dashboard
          </button>
          <button type="button" className="nav-item">
            Products
          </button>
          <button type="button" className="nav-item">
            Orders
          </button>
          <button type="button" className="nav-item">
            Customers
          </button>
          <button type="button" className="nav-item">
            Settings
          </button>
        </nav>
        <div className="sidebar-footer">
          <span className="pill">Online</span>
          <span>{currentUser}</span>
        </div>
      </aside>

      <section className="dashboard-page">
        <header className="topbar">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {currentUser}. Product and pricing overview.</p>
          </div>
          <div className="topbar-actions">
            <button type="button" className="ghost-btn" onClick={() => void loadProducts()}>
              Refresh
            </button>
            <button type="button" className="ghost-btn danger" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>

        <section className="stats-grid">
          <article className="stat-card highlight">
            <h3>Total products</h3>
            <strong>{products.length}</strong>
            <p>Synced with product-service</p>
          </article>
          <article className="stat-card">
            <h3>Total categories</h3>
            <strong>{categoryCount}</strong>
            <p>Unique category tags</p>
          </article>
          <article className="stat-card">
            <h3>Total catalog value</h3>
            <strong>{totalStockValue.toLocaleString('en-US')} TRY</strong>
            <p>Average: {averagePrice.toLocaleString('en-US', { maximumFractionDigits: 2 })} TRY</p>
          </article>
        </section>

        <section className="table-card">
          <div className="table-toolbar">
            <h2>Products</h2>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by product or category..."
            />
          </div>

          {loading && <p>Loading products...</p>}
          {error && <p className="error-text">Backend error: {error}</p>}
          {!loading && !error && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th className="right">Price</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>
                      <div className="product-name">{product.name}</div>
                    </td>
                    <td>
                      <span className="category-badge">{product.category}</span>
                    </td>
                    <td className="right">{product.price.toLocaleString('en-US')} TRY</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
