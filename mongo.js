const mongoose = require('mongoose')

// Check if password provided
if (process.argv.length < 3) {
    console.log('Please provide the password for the mongoDB');
    process.exit(1)
}

const password = process.argv[2]

// Connect to database
const url =
    `mongodb+srv://fullstack:${password}@cluster0.enxcx.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

// Create overall schema
const personSchema = new mongoose.Schema({
    'name': String,
    'number': String
})

// Add schema to model
const Person = mongoose.model('Person', personSchema)

// Check if no extra args except password provided
if (process.argv.length === 3) {
    Person
        .find({})
        .then(result => {
            console.log('phonebook')
            result.forEach(entry => console.log(`${entry.name} ${entry.number}`))
            mongoose.connection.close()
        })
} else {
    // Add new person to mongoDB
    let newName = process.argv[3]
    let newNumber = process.argv[4]

    const person = new Person({
        'name': newName,
        'number': newNumber,
    })

    person.save().then(response => {
        console.log(`added ${person.name} number ${person.number} to phonebook`);
        mongoose.connection.close()
    })

}
