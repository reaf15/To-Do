import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function taskStoragePlugin() {
  const dataFilePath = path.resolve(__dirname, 'data/tasks.json')

  return {
    name: 'task-storage-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 1. Get Server Network Info
        if (req.url === '/api/server-info' && req.method === 'GET') {
          const networkInterfaces = os.networkInterfaces()
          const ips = []
          for (const iface of Object.values(networkInterfaces)) {
            for (const config of iface || []) {
              if (config.family === 'IPv4' && !config.internal && !config.address.startsWith('169.254')) {
                ips.push(config.address)
              }
            }
          }
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({
            ip: ips[0] || 'localhost',
            allIps: ips,
            port: 5173
          }))
          return
        }

        // 2. GET all tasks
        if (req.url === '/api/tasks' && req.method === 'GET') {
          if (fs.existsSync(dataFilePath)) {
            const data = fs.readFileSync(dataFilePath, 'utf-8')
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(data)
          } else {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify([]))
          }
          return
        }

        // 3. POST save all tasks (Real-time synchronization across staff PCs)
        if (req.url === '/api/tasks' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body)
              fs.writeFileSync(dataFilePath, JSON.stringify(parsed, null, 2), 'utf-8')
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ success: true, count: parsed.length, updatedAt: Date.now() }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        // 4. GET all custom databases
        if (req.url === '/api/databases' && req.method === 'GET') {
          const dbFilePath = path.resolve(__dirname, 'data/custom_databases.json')
          if (fs.existsSync(dbFilePath)) {
            const data = fs.readFileSync(dbFilePath, 'utf-8')
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(data)
          } else {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify([]))
          }
          return
        }

        // 5. POST save all custom databases (Create, Update, Delete DB and rows)
        if (req.url === '/api/databases' && req.method === 'POST') {
          const dbFilePath = path.resolve(__dirname, 'data/custom_databases.json')
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body)
              fs.writeFileSync(dbFilePath, JSON.stringify(parsed, null, 2), 'utf-8')
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ success: true, count: parsed.length, updatedAt: Date.now() }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), taskStoragePlugin()],
  server: {
    host: '0.0.0.0', // Listen on all network addresses for other employees
    port: 5173,
    strictPort: true,
  }
})
