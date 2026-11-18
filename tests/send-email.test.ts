// tests/send-email.test.ts
// tests/send-email.test.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { beforeEach, describe, expect, it, vi } from 'vitest'

process.env.AWS_REGION = 'us-east-2'
process.env.AWS_ACCESS_KEY_ID = 'mock-key'
process.env.AWS_SECRET_ACCESS_KEY = 'mock-secret'
process.env.SES_FROM = 'test@example.com'

const { sendMock, verifyIdTokenMock } = vi.hoisted(() => {
    return {
        sendMock: vi.fn().mockResolvedValue({ MessageId: 'msg-12345' }),
        verifyIdTokenMock: vi.fn().mockResolvedValue({ email: 'test@example.com' }),
    }
})

// Mocks de AWS SDK v2 adaptados para soportar el operador `new`
vi.mock('@aws-sdk/client-sesv2', () => ({
    SESv2Client: function () {
        return { send: sendMock }
    },
    SendEmailCommand: function (input: any) {
        return input
    },
}))

vi.mock('firebase-admin/auth', () => ({
    getAuth: vi.fn(() => ({
        verifyIdToken: verifyIdTokenMock,
    })),
}))

vi.mock('firebase-admin/app', () => ({
    getApps: vi.fn(() => [{}]),
    initializeApp: vi.fn(),
    cert: vi.fn(),
}))

import handler from '../api/send-summary'

describe('api/send-summary', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        sendMock.mockResolvedValue({ MessageId: 'msg-12345' })
    })

    const createResponse = () => {
        const statusMock = vi.fn()
        const jsonMock = vi.fn()
        const response = { status: statusMock, json: jsonMock } as unknown as VercelResponse
        statusMock.mockReturnValue(response)
        return { response, statusMock, jsonMock }
    }

    const createRequest = (body: any, method = 'POST', headers: any = { authorization: 'Bearer mock-token' }) => ({
        method,
        body,
        headers,
    }) as unknown as VercelRequest

    it('devuelve código 405 si el método HTTP no es POST', async () => {
        const { response, statusMock, jsonMock } = createResponse()
        await handler(createRequest({}, 'GET'), response)
        expect(statusMock).toHaveBeenCalledWith(405)
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'Método no permitido' }))
    })

    it('devuelve código 401 si falta el token de autorización', async () => {
        const { response, statusMock, jsonMock } = createResponse()
        await handler(createRequest({}, 'POST', {}), response)
        expect(statusMock).toHaveBeenCalledWith(401)
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ok: false, error: 'Falta el token' }))
    })

    it('envía el resumen de tareas exitosamente', async () => {
        const { response, statusMock, jsonMock } = createResponse()
        const validBody = {
            tasks: [{ title: 'Estudiar React', completed: false, folder: 'Pendientes' }],
        }

        await handler(createRequest(validBody), response)

        expect(statusMock).toHaveBeenCalledWith(200)
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ok: true }))
        expect(sendMock).toHaveBeenCalled()
    })
})