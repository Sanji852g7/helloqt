import { createContext, useContext, useState } from 'react'

const QuizContext = createContext(null)

// Shares the lash-finder quiz's open state app-wide, so it can be triggered
// from the home hero, the mobile menu, or anywhere else - not just the page
// that happens to render the modal
export function QuizProvider({ children }) {
  const [open, setOpen] = useState(false)

  const value = {
    quizOpen: open,
    openQuiz: () => setOpen(true),
    closeQuiz: () => setOpen(false),
  }

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>
}

// Gives components access to the shared quiz context
export const useQuiz = () => {
  const context = useContext(QuizContext)
  if (!context) throw new Error('useQuiz must be used inside QuizProvider')
  return context
}
