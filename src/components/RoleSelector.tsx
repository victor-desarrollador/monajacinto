export type Role = 'SELLER' | 'CASHIER'

interface RoleSelectorProps {
  role: Role
  onSelect: (role: Role) => void
}

const ROLES: { value: Role; title: string; hint: string }[] = [
  { value: 'SELLER', title: 'Vendedor', hint: 'Arma la venta y envía a caja' },
  { value: 'CASHIER', title: 'Cajero', hint: 'Cobra, da el cambio y finaliza' },
]

export function RoleSelector({ role, onSelect }: RoleSelectorProps) {
  return (
    <nav className="pos-roles" aria-label="Seleccionar rol">
      {ROLES.map((r) => (
        <button
          key={r.value}
          type="button"
          className={role === r.value ? 'pos-role pos-role--active' : 'pos-role'}
          aria-pressed={role === r.value}
          onClick={() => onSelect(r.value)}
        >
          <span className="pos-role__title">{r.title}</span>
          <span className="pos-role__hint">{r.hint}</span>
        </button>
      ))}
    </nav>
  )
}