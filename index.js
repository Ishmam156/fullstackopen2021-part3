require('dotenv').config();

const express = require('express')
var morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

// Load mongoDB with model
const Person = require('./models/person');
const { response } = require('express');

// Custom token to get content body for POST method
morgan.token('content', function (req, res) {

    if (req.method === 'POST') {
        const logging = req.body

        return JSON.stringify(logging)
    }
    return ""
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

// Default Route
app.get('/', (request, response) => {
    response.send('<h1>Testing Phonebook!</h1>')
})

// Persons route showing all persons
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => response.json(persons))
})

// Info route showing summary
app.get('/info', (request, response, next) => {
    Person.countDocuments({})
        .then(result => response.send(`<p>Phonebook has info for ${result} people.</p><p>${new Date()}</p>`))
        .catch(error => next(error))
})

// Unique person information
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

// Update phone number
app.put('/api/persons/:id', (request, response, next) => {
    const body = { ...request.body }

    const updatePerson = {
        'number': body.number
    }

    Person.findByIdAndUpdate(request.params.id, updatePerson, { 'new': true, runValidators: true })
        .then(updatedPerson => response.json(updatedPerson))
        .catch(error => next(error))
})

// Delete unique person
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id,)
        .then(result => response.status(204).end())
        .catch(error => next(error))
})

// Add new entry
app.post('/api/persons', (request, response, next) => {
    const body = { ...request.body }

    const newPerson = new Person({
        'name': body.name,
        'number': body.number,
    })

    newPerson.save()
        .then(savedPerson => response.json(savedPerson))
        .catch(error => next(error))
})

// ErrorHandler middleware
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})