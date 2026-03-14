import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Hash, Lock, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Input, Select } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { ROLES, KELAS_OPTIONS } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nama: '',
    nomorInduk: '',
    password: '',
    confirmPassword: '',
    kelas: '',
    role: ROLES.STUDENT,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.nama.trim()) errs.nama = 'Nama lengkap wajib diisi'
    if (!form.nomorInduk.trim()) errs.nomorInduk = 'Nomor induk wajib diisi'
    if (!form.password) errs.password = 'Password wajib diisi'
    else if (form.password.length < 6) errs.password = 'Password minimal 6 karakter'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Password tidak cocok'
    if (form.role === ROLES.STUDENT && !form.kelas) errs.kelas = 'Pilih kelas'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    await new Promise(r => setTimeout(r, 500))

    const result = register(form)
    setLoading(false)

    if (result.success) {
      toast.success('Akun berhasil dibuat!')
      navigate(result.user.role === ROLES.TEACHER ? '/teacher/dashboard' : '/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }))

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <div className="auth-logo-icon">Bj</div>
        <h1>B<span>Jurnal</span></h1>
        <p>Buat Akun Baru</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Role Selector */}
        <div className="input-group">
          <label className="input-label">Daftar sebagai</label>
          <div className="role-selector">
            <button
              type="button"
              className={`role-option ${form.role === ROLES.STUDENT ? 'active' : ''}`}
              onClick={() => setField('role', ROLES.STUDENT)}
            >
              🎓 Murid
            </button>
            <button
              type="button"
              className={`role-option ${form.role === ROLES.TEACHER ? 'active' : ''}`}
              onClick={() => setField('role', ROLES.TEACHER)}
            >
              📚 Guru
            </button>
          </div>
        </div>

        <Input
          label="Nama Lengkap"
          icon={User}
          placeholder="Masukkan nama lengkap"
          value={form.nama}
          onChange={e => setField('nama', e.target.value)}
          error={errors.nama}
        />

        <Input
          label="Nomor Induk"
          icon={Hash}
          placeholder={form.role === ROLES.STUDENT ? 'NIS' : 'NIP / NUPTK'}
          value={form.nomorInduk}
          onChange={e => setField('nomorInduk', e.target.value)}
          error={errors.nomorInduk}
        />

        {form.role === ROLES.STUDENT && (
          <Select
            label="Kelas"
            placeholder="Pilih kelas"
            options={KELAS_OPTIONS}
            value={form.kelas}
            onChange={e => setField('kelas', e.target.value)}
            error={errors.kelas}
          />
        )}

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Minimal 6 karakter"
          value={form.password}
          onChange={e => setField('password', e.target.value)}
          error={errors.password}
        />

        <Input
          label="Konfirmasi Password"
          type="password"
          icon={Lock}
          placeholder="Ketik ulang password"
          value={form.confirmPassword}
          onChange={e => setField('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
        />

        <Button type="submit" fullWidth loading={loading}>
          Daftar
        </Button>
      </form>

      <div className="auth-footer">
        Sudah punya akun? <Link to="/login">Masuk di sini</Link>
      </div>
    </div>
  )
}
