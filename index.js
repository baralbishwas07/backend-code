require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
// app.use(morgan('tiny'))

morgan.token('body', function(req) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  Person.countDocuments()
    .then(count => {
      const date = new Date()
      response.send(`
            <p>Phonebook has info for ${count} people</p>
            <p>${date}</p>
        `)
    })
    .catch(() => {
      response.status(500).send({ error: 'Error retrieving data' })
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (!person) {
      return response.status(404).json({ error: 'Person not found' })
    }
    response.json(person)
  })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const name = body.name
  const number = body.number
  Person.findOne({ name }).then(existingPerson => {
    if (existingPerson) {
      return response.status(400).json({ error: 'name must be unique' })
    }

    if (!name) {
      return response.status(400).json({ error: 'name is missing' })
    } else if (!number) {
      return response.status(400).json({ error: 'number is missing' })
    }

    const person = new Person({
      name: name,
      number: number,
    })

    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
      .catch(error => next(error))
  })
})

app.put('/api/persons/:id', (request, response, next) => {

  const note = {
    name: request.body.name,
    number: request.body.number
  }

  Person.findByIdAndUpdate(request.params.id, note, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  if(error.name === 'CastError'){
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
