import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Hash, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Input } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { ROLES } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nomorInduk: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.nomorInduk.trim()) errs.nomorInduk = 'Nomor induk wajib diisi'
    if (!form.password) errs.password = 'Password wajib diisi'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const result = await login(form.nomorInduk, form.password)
    setLoading(false)

    if (result.success) {
      toast.success(`Selamat datang, ${result.user.nama}!`)
      navigate(result.user.role === ROLES.TEACHER ? '/teacher/dashboard' : '/dashboard')
    } else {
      toast.error(result.message)
      setErrors({ nomorInduk: ' ', password: result.message })
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <div className="auth-logo-icon">Bj</div>
        <h1>B<span>Jurnal</span></h1>
        <p>Catatan Cerdasmu</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          label="Nomor Induk"
          icon={Hash}
          placeholder="Masukkan nomor induk"
          value={form.nomorInduk}
          onChange={e => setForm({ ...form, nomorInduk: e.target.value })}
          error={errors.nomorInduk}
          autoFocus
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Masukkan password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />
        <Button type="submit" fullWidth loading={loading}>
          Masuk
        </Button>
      </form>

      <div className="auth-footer">
        Belum punya akun? <Link to="/register">Daftar di sini</Link>
      </div>

      <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Demo Login:</strong><br />
        Murid: 2024001 / murid123<br />
        Guru: 1980001 / guru123
      </div>
    </div>
  )
}
