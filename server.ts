import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())

const PORT = process.env.PORT || 3001
const uri = process.env.MONGODB_URI!
const client = new MongoClient(uri)

app.get('/api/companies', async (req, res) => {
	const city = req.query.city?.toString()?.toUpperCase()
	const page = parseInt(req.query.page as string) || 1
	const pageSize = 10

	try {
		await client.connect()
		const db = client.db('PRH_OHJELMISTOALA')
		const collection = db.collection('ohjelmistoalan_yritykset')

		const query = {
			'addresses.postOffices.city': city,
		}

		const total = await collection.countDocuments(query)
		const companies = await collection
			.find(query)
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.toArray()

		res.json({ companies, total })
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})