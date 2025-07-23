import request from 'supertest'
import app from '../index'
import { describe, test, expect } from '@jest/globals'

describe('API Tests', () => {
    test('GET / Welcome to the REST API!', async () => {
        const response = await request(app).get('/')
        expect(response.status).toBe(200)
        expect(response.text).toBe('Welcome to the REST API!')
    })
})

