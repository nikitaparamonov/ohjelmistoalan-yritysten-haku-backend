import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())

const PORT = process.env.PORT || 3001
const uri = process.env.MONGODB_URI!

const client = new MongoClient(uri, { autoSelectFamily: false })
let db: any

client
	.connect()
	.then(() => {
		db = client.db('PRH_OHJELMISTOALA')
		console.log('MongoDB connected')
	})
	.catch((err) => {
		console.error('MongoDB connection error:', err)
	})

app.get('/api/companies', async (req, res) => {
	try {
		if (!db) {
			return res.status(500).json({ error: 'Database not initialized' })
		}

		const city = req.query.city?.toString()
		const page = parseInt(req.query.page as string) || 1
		const pageSize = 10

		if (!city || city.trim() === '') {
			return res.status(400).json({ error: 'City parameter is required' })
		}

		const query = {
			'addresses.postOffices.city': { $regex: `^${city.trim()}$`, $options: 'i' },
		}

		const collection = db.collection('ohjelmistoalan_yritykset')
		const total = await collection.countDocuments(query)
		const companies = await collection
			.find(query)
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.toArray()

		res.json({ companies, total })
	} catch (error) {
		console.error('Error in /api/companies:', error)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})