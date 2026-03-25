import toast from 'react-hot-toast'

const base =
  '!rounded-xl !px-4 !py-3 !text-[13px] !font-[family-name:var(--font-inter)] !shadow-lg !max-w-[min(100vw-2rem,320px)]'

export function toastAddCharacter(name: string) {
  toast.success(`⚡ ${name} joins your team!`, {
    className: `${base} !bg-[#13152a] !text-[#f0ede6] !border !border-[#c9922a]/60`,
    duration: 3000,
    position: 'top-right',
  })
}

export function toastRemoveCharacter(name: string) {
  toast(`${name} removed from team`, {
    className: `${base} !bg-[#1a1d35] !text-[#8a8fa8]`,
    duration: 3000,
    position: 'top-right',
  })
}

export function toastCantAfford(name: string) {
  toast.error(`Not enough Drachma for ${name}!`, {
    className: `${base} !bg-[#13152a] !text-[#f0ede6] !border !border-red-500/50`,
    duration: 3000,
    position: 'top-right',
  })
}

export function toastTeamFull() {
  toast.error('Your team is full — remove someone first', {
    className: `${base} !bg-[#13152a] !text-[#f0ede6] !border !border-amber-500/50`,
    duration: 3000,
    position: 'top-right',
  })
}

export function toastRandomise() {
  toast('The Fates have chosen your team!', {
    className: `${base} !bg-[#13152a] !text-[#f0ede6] !border !border-purple-500/50`,
    duration: 3000,
    position: 'top-right',
  })
}

export function toastCustomCreature(name: string) {
  toast.success(`Your creature ${name} awakens!`, {
    className: `${base} !bg-[#13152a] !text-[#f0ede6] !border !border-[#c9922a]/60`,
    duration: 3000,
    position: 'top-right',
  })
}

export function toastCustomTeamUpdated(name: string) {
  toast.success(`${name} — saved to your team!`, {
    className: `${base} !bg-[#13152a] !text-[#f0ede6] !border !border-[#c9922a]/45`,
    duration: 2500,
    position: 'top-right',
  })
}

export function toastCustomNeedsName() {
  toast.error('Give your creature a name before saving to the team.', {
    className: `${base} !bg-[#13152a] !text-[#f0ede6] !border !border-amber-500/50`,
    duration: 3000,
    position: 'top-right',
  })
}

export function toastCustomRemoved(name: string) {
  toast(`${name} removed from your team`, {
    className: `${base} !bg-[#1a1d35] !text-[#8a8fa8]`,
    duration: 3000,
    position: 'top-right',
  })
}

export function toastBudgetLow(remaining: number) {
  toast(`Only ${remaining} Drachma remaining — choose wisely!`, {
    className: `${base} !bg-[#13152a] !text-[#f0ede6] !border !border-amber-500/50`,
    duration: 3000,
    position: 'top-right',
  })
}
