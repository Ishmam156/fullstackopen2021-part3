const express = require('express')
var morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

// Custom token to get content body for POST method
morgan.token('content', function (req, res) {

    if (req.method === 'POST') {
        const logging = req.body

        return JSON.stringify(logging)
    }
    return ""
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

// Default Route
app.get('/', (request, response) => {
    response.send('<h1>Testing Phonebook!</h1>')
})

// Persons route showing all persons
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

// Info route showing summary
app.get('/info', (request, response) => {
    const currentTime = new Date()
    response.send(`<p>Phonebook has info for ${persons.length} people.</p><p>${currentTime}</p>`)
})

// Unique person information
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const number = persons.find(person => person.id === id)

    if (number) {
        response.json(number)
    } else {
        response.status(404).end()
    }
})

// Delete unique person
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

// Add new entry
app.post('/api/persons', (request, response) => {
    const newEntry = { ...request.body }

    // Check for errors
    if (!newEntry.number) {
        return response.status(400).json({
            'error': 'provide number correctly.'
        })
    } else if (!newEntry.name) {
        return response.status(400).json({
            'error': 'provide name correctly.'
        })
    } else if (persons.map(person => person.name).includes(newEntry.name)) {
        return response.status(400).json({
            'error': 'name must be unique.'
        })
    }

    // Add ID and concat
    newEntry.id = Math.floor(Math.random() * 100000)
    persons = persons.concat(newEntry)

    response.json(newEntry)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})