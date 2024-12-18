import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../components/Login';

describe('Login Component', () => {
    const renderLogin = () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </BrowserRouter>
        );
    };

    test('renders login form', () => {
        renderLogin();
        
        // Verifica que los elementos existan
        expect(screen.getByLabelText('Email:')).toBeInTheDocument();
        expect(screen.getByLabelText('Contraseña:')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    test('allows entering email and password', () => {
        renderLogin();
        
        const emailInput = screen.getByLabelText('Email:');
        const passwordInput = screen.getByLabelText('Contraseña:');
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        
        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    test('shows link to register', () => {
        renderLogin();
        
        const registerLink = screen.getByText('Regístrate aquí');
        expect(registerLink).toBeInTheDocument();
        expect(registerLink.getAttribute('href')).toBe('/register');
    });
});