export const transitionSpec = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
  mass: 0.8,
} as const;
export const channelTransition = { duration: 0.25, ease: [0.16, 1, 0.3, 1] } as const;
