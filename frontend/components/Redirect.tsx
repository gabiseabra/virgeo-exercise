import { useEffect } from 'react'
import { useNavigate } from 'react-router'

const Redirect = ({ to }: { to: string }) => {
  const navigate = useNavigate()
  useEffect(() => { navigate(to) }, [navigate, to])
  return null
}

export default Redirect
