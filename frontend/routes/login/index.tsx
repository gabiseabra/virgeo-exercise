import { useCallback, useRef } from 'react'
import { useAuth, withAuth } from '@/context/auth'
import Shell from '@/components/app/Shell'
import Redirect from '@/components/common/Redirect'
import { logApiError } from '@/hooks/useFetch'
import Camera, { lookAt } from '@/components/three/Camera'
import { Title } from '@/components/ui/Text'
import Form from '@/components/ui/Form'
import { Badge, useToast } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Interactive'

function Login() {
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const { loading, error, login } = useAuth()
  const toast = useToast()

  const handleSubmit = useCallback(async (e: React.SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const username = usernameRef.current?.value
    const password = passwordRef.current?.value
    if (!username || !password) return
    try {
      await login({ username, password })
      toast.success({ children: 'Logged in!' })
    }
    catch (error) {
      logApiError()(error)
    }
  }, [login])

  return (
    <div>
      <Shell.Header>
        <Title>Login</Title>
      </Shell.Header>

      <Camera.Config
        fov={45}
        position={[0, 0, 3]}
        rotation={lookAt(
          [0, 0, 3],
          [-1.1, -0.25, 0],
          [0.3, 0.7, 0],
        )}
        transitionDuration={1000}
      />

      <Form onSubmit={handleSubmit}>
        {error && <Badge variant="error">{error.message}</Badge>}

        <Form.Field>
          <Form.Label>Username</Form.Label>
          <input ref={usernameRef} name="username" type="text" required />
        </Form.Field>

        <Form.Field>
          <Form.Label>Password</Form.Label>
          <input ref={passwordRef} name="password" type="password" required />
        </Form.Field>

        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          onClick={handleSubmit}
        >
          Login
        </Button>
      </Form>
    </div>
  )
}

export default withAuth(
  () => <Redirect to="/" />,
  Login,
  Login,
)
