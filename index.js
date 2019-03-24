const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(bodyParser.json())
app.use(cors())

morgan.token('body', (req, res) => Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : "")
// tiny on :method :url :status :res[content-length] - :response-time ms
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let notes = [
    {
        "name": "Martti Tienari",
        "number": "040-123456",
        "id": 2
    },
    {
        "name": "Arto Järvinen",
        "number": "040-123456",
        "id": 3
    },
    {
        "name": "Lea Kutvonen",
        "number": "040-123456",
        "id": 4
    },
    {
        "name": "Pekka Ranta",
        "number": "040-123456",
        "id": 5
    }
]

const generateId = () => {
    return Math.floor(Math.random() * 100000)
}

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const note = notes.find(n => n.id === id)
    if (note) { res.json(note) }
    else { res.status(404).end() }
})
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    notes = notes.filter(n => n.id !== id)

    res.status(204).end()
})

app.get('/api/persons', (req, res) => {
    res.json(notes)
})

app.post('/api/persons', (req, res) => {
    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }
    if (notes.find(p => p.name === body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }
    const newPerson = {
        name: body.name,
        number: body.number,
        id: generateId()
    }
    notes = notes.concat(newPerson)
    res.json(newPerson)
})

app.get('/info', (req, res) => {
    res.send('<p>Puhelinluettelossa on ' + notes.length + " henkilön tiedot</p>"
        + '<p>' + (new Date) + "</p>")
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})