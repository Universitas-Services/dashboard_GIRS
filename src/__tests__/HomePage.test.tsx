import { render, screen, fireEvent } from '@testing-library/react';
// Ajustamos la ruta para salir de __tests__/components/ e ir a components/
import LoginForm from '../components/LoginForm';

// 1. Mock de useRouter (Next.js)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// 2. Mock del store de Zustand
// Ajustamos la ruta para llegar a src/stores/
jest.mock('../stores/useAuthStore', () => ({
  useAuthStore: (selector: (state: { setAuth: unknown }) => unknown) =>
    selector({
      setAuth: jest.fn(),
    }),
}));

// 3. Mock del servicio de autenticación
// Ajustamos la ruta para llegar a src/services/
jest.mock('../services/authService', () => ({
  authService: {
    login: jest.fn(),
  },
  // Importante: usamos requireActual con la ruta relativa correcta
  loginSchema: jest.requireActual('../services/authService').loginSchema,
}));

describe('LoginForm Component', () => {
  it('debe renderizar el título de Iniciar Sesión', () => {
    render(<LoginForm />);
    const heading = screen.getByText(/Iniciar Sesión/i);
    expect(heading).toBeInTheDocument();
  });

  it('debe mostrar validación si se envía vacío', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /Ingresar/i });
    fireEvent.click(submitButton);

    const emailError = await screen.findByText(/Correo electrónico inválido/i);
    const passwordError = await screen.findByText(
      /La contraseña es requerida/i
    );

    expect(emailError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();
  });
});
