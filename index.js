const express = require('express')
const morgan = require('morgan')
const cors =require('cors')

const app = express()

let persons = [
    { 
      id: "1",
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: "2",
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: "3",
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: "4",
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
]

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
// app.use(morgan('tiny'))

morgan.token('body', function(req, res) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const getId = () => {
    const id = String(Math.floor(Math.random() * 10000))

    return id
}

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const date = new Date()
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${date}</p>
        `)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)

    if(person){
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    const name = body.name
    const number = body.number
    const nameExist = persons.some(person => person.name === name)

    if(!name){
        return response.status(400).json({
            error: 'name is missing'
        })
    } else if(!number){
        return response.status(400).json({
            error: 'number is missing'
        })
    } else if(nameExist){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    const person = {
        id: getId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    response.json(person)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})