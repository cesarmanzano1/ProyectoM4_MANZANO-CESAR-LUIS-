// tests/RegisterPage.test.tsx
// tests/TaskFormModal.test.tsx
/**
 * @vitest-environment jsdom
 */
import { TaskFormModal } from '../src/components/TaskFormModal'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

describe('TaskFormModal', () => {
    const mockOnClose = vi.fn()
    const mockOnSubmit = vi.fn()
    
    afterEach(() => {
        cleanup()
    })

    beforeEach(() => {
        vi.clearAllMocks()
        mockOnSubmit.mockResolvedValue(undefined)
    })

    it('no envía el formulario si el título está vacío', async () => {
        const user = userEvent.setup()
        render(
            <TaskFormModal
                currentFolder="Pendientes"
                userEmail="test@example.com"
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        )

        await user.click(screen.getByRole('button', { name: 'Guardar Tarea' }))
        expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('envía los datos correctamente al rellenar el formulario de nueva tarea', async () => {
        const user = userEvent.setup()
        render(
            <TaskFormModal
                currentFolder="Pendientes"
                userEmail="test@example.com"
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        )

        const titleInputs = screen.getAllByPlaceholderText('Ej. Integración API')
        await user.type(titleInputs[0], 'Diseñar Base de Datos')
        
        const descInputs = screen.getAllByPlaceholderText('Detalles de la tarea...')
        await user.type(descInputs[0], 'Esquema en PostgreSQL')
        
        const cesarInputs = screen.getAllByPlaceholderText('Ej. César')
        await user.type(cesarInputs[0], 'César')

        // Rellenar la fecha límite obligatoria para que pase la validación
        const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
        if (dateInput) {
            await user.type(dateInput, '2026-12-31')
        }

        await user.click(screen.getByRole('button', { name: 'Guardar Tarea' }))

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledOnce()
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Diseñar Base de Datos',
                    description: 'Esquema en PostgreSQL',
                    assignedTo: 'César',
                    dueDate: '2026-12-31',
                    folder: 'Pendientes',
                }),
                undefined
            )
        })
    })

    it('carga los datos correctamente al editar una tarea existente', async () => {
        const user = userEvent.setup()
        const taskMock = {
            id: 'task-123',
            title: 'Tarea a Editar',
            description: 'Descripción vieja',
            createdBy: 'test@example.com',
            assignedTo: 'Luis',
            priority: 'Alta',
            dueDate: '2026-12-31',
            folder: 'En Proceso'
        }

        render(
            <TaskFormModal
                currentFolder="Pendientes"
                userEmail="test@example.com"
                taskToEdit={taskMock}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        )

        expect(screen.getByDisplayValue('Tarea a Editar')).toBeTruthy()
        expect(screen.getByDisplayValue('Descripción vieja')).toBeTruthy()
        expect(screen.getByDisplayValue('Luis')).toBeTruthy()

        const titleInput = screen.getByDisplayValue('Tarea a Editar')
        await user.clear(titleInput)
        await user.type(titleInput, 'Tarea Actualizada')

        await user.click(screen.getByRole('button', { name: 'Actualizar Tarea' }))

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Tarea Actualizada',
                    folder: 'En Proceso',
                }),
                'task-123'
            )
        })
    })
})