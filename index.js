require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(cors())

morgan.token('body', (req, res) => Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : "")
// tiny on :method :url :status :res[content-length] - :response-time ms
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id).then(person => {
        if (person) {
            res.json(person.toJSON())
        } else {
            res.status(404).end()
        }
    }).catch(err => next(err))
})
app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            if (updatedPerson) {
                res.json(updatedPerson.toJSON())
            } else {
                res.status(404).end()
            }
        }).catch(err => next(err))
})
app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id).then(result => {
        res.status(204).end()
    }).catch(err => next(err))
})

app.get('/api/persons', (req, res, next) => {
    Person.find({}).then(persons => {
        res.json(persons.map(p => p.toJSON()))
    }).catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }
    const newPerson = new Person({
        name: body.name,
        number: body.number
    })
    newPerson.save().then(p => {
        res.json(p.toJSON())
    }).catch(err => next(err))

})

app.get('/info', (req, res) => {
    Person.count({}).then(count => {
        res.send(`<p>Puhelinluettelossa on ${count} henkilön tiedot</p>
        <p>${new Date}</p>`)
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})