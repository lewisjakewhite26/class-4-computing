import { motion } from 'framer-motion'
import { TYPE_COLORS } from '../../../data/characters'

function initial(name: string) {
  return name.charAt(0).toUpperCase()
}

export function CharacterAvatar({
  name,
  type1,
  size = 160,
  shakeKey = 0,
  fainted = false,
  pulse = false,
  align = 'center',
}: {
  name: string
  type1: string
  size?: number
  shakeKey?: number
  fainted?: boolean
  pulse?: boolean
  align?: 'left' | 'right' | 'center'
}) {
  const tc = TYPE_COLORS[type1] ?? TYPE_COLORS.Normal
  const justify =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'

  return (
    <div className={`flex ${justify}`}>
      <motion.div
        className="flex items-center justify-center rounded-full border-2 font-[family-name:var(--font-cinzel)] font-bold text-white"
        style={{
          width: size,
          height: size,
          fontSize: 64,
          backgroundColor: tc.bg,
          borderColor: `${tc.glow}99`,
          boxShadow: `0 0 24px ${tc.glow}44`,
        }}
        initial={false}
        animate={
          fainted
            ? { scale: 0, opacity: 0 }
            : pulse
              ? { scale: [1, 1.04, 1], opacity: [1, 0.92, 1] }
              : { scale: 1, opacity: 1 }
        }
        transition={
          fainted
            ? { duration: 0.6, ease: 'easeIn' }
            : pulse
              ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 }
        }
      >
        <motion.span
          key={shakeKey}
          className="inline-flex items-center justify-center"
          initial={{ x: 0 }}
          animate={shakeKey > 0 && !fainted ? { x: [0, -6, 6, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {fainted ? '' : initial(name)}
        </motion.span>
      </motion.div>
    </div>
  )
}
