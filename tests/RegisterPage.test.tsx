// tests/RegisterPage.test.tsx
/**
 * @vitest-environment jsdom
 */
// import { render, screen, waitFor } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
// import { beforeEach, describe, expect, it, vi } from 'vitest'
 import { LoginPage } from '../src/pages/LoginPage'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'

const { signInMock, signInWithGoogleMock } = vi.hoisted(() => ({
    signInMock: vi.fn(),
    signInWithGoogleMock: vi.fn(),
}))

vi.mock('../src/context/AuthContext', () => ({
    useAuth: () => ({
        user: null,
        userProfile: null,
        loading: false,
        signIn: signInMock,
        signUp: vi.fn(),
        signInWithGoogle: signInWithGoogleMock,
        logout: vi.fn(),
    }),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    }
})

describe('LoginPage', () => {
    // beforeEach(() => {
    //     vi.clearAllMocks()
    //     signInMock.mockResolvedValue({ user: { email: 'test@example.com' } })
    //     signInWithGoogleMock.mockResolvedValue({ user: { email: 'google@example.com' } })
    // })
    afterEach(() => {
    cleanup()
})

    it('permite ingresar correo y contraseña e inicia sesión correctamente', async () => {
        const user = userEvent.setup()
        render(<LoginPage />)

        const emailInputs = screen.getAllByPlaceholderText('nombre@correo.com')
        await user.type(emailInputs[0], 'test@example.com')
        
        const passwordInputs = screen.getAllByPlaceholderText('Contraseña')
        await user.type(passwordInputs[0], 'password123')
        
        await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

        await waitFor(() => {
            expect(signInMock).toHaveBeenCalledWith('test@example.com', 'password123')
        })
    })

    it('muestra un mensaje de error si las credenciales son incorrectas', async () => {
        const user = userEvent.setup()
        signInMock.mockRejectedValueOnce(new Error('Credenciales inválidas'))
        render(<LoginPage />)

        const emailInputs = screen.getAllByPlaceholderText('nombre@correo.com')
        await user.type(emailInputs[0], 'wrong@example.com')
        
        const passwordInputs = screen.getAllByPlaceholderText('Contraseña')
        await user.type(passwordInputs[0], 'badpass')
        
        await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

        const errorMessage = await screen.findByText(/Correo o contraseña incorrectos/i)
        expect(errorMessage).toBeTruthy()
    })
})