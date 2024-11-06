/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import PersonList from './components/PersonList'
import phonebookService from './services/phonebook'
import './App.css'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filtered, setFiltered] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  useEffect(() => {
    phonebookService
      .getAll() 
      .then(response => { 
        console.log('fetched personss:', response.data)
        setPersons(response.data) 
      })
      .catch(error => {
        console.error('Error fetching persons:', error)
      })
  }, [])

  const handleError = (error) => {
    console.error(error.message)

    if (error.response && error.response.data && error.response.data.error) {
      setErrorMessage(error.response.data.error)
      console.log(error.response.data.error)
    } else {
      setErrorMessage('Name or number wrong')
    }
    setTimeout(() => setErrorMessage(''), 5000)
  }

  const addName = (event) => {
    event.preventDefault()

    const nameExists = Array.isArray(persons) ? persons.find(person => person.name === newName) : undefined
    if (nameExists) { 
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const updatedPerson = {...nameExists, number: newNumber}

        phonebookService
        .update(nameExists.id, updatedPerson)
        .then(returnedPerson => {
          setPersons(currentPersons => 
            currentPersons.map(person => person.id !== nameExists.id ? person : returnedPerson.data))
          console.log('Returned person:', returnedPerson);
          setSuccessMessage(`Updated ${returnedPerson.data.name}`)
          setNewName('')
          setNewNumber('')
          setTimeout(() => setSuccessMessage(''), 10000)
        })
        .catch(handleError)
      }
    } else if (newName.trim() && newNumber.trim()) {
      const nameObject = {
        name: newName,
        number: newNumber,
      }

      phonebookService
        .create(nameObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson.data))
          setNewName('')
          setNewNumber('')
          setSuccessMessage(`Added ${returnedPerson.data.name}`)
          setTimeout(() => setSuccessMessage(''), 3000)
        })
        .catch(handleError)
    }
  }

  const filteredPersons = persons.filter(person => 
    person.name && person.name.toLowerCase().includes(filtered.toLowerCase())
  )
  
  const deletePerson = (id) => {
    const deleteThisPerson = Array.isArray(persons) ? persons.find(person => person.id === id) : undefined
    if (window.confirm(`Delete ${deleteThisPerson.name}?`)) {
      phonebookService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          setSuccessMessage(`${deleteThisPerson.name} was successfully deleted`)
          setTimeout(() => setSuccessMessage(''), 3000)
        })
        .catch(error => {
          if (error.response && error.response.status === 404) {
            console.warn('Person deleted already', error)
            setErrorMessage(`${deleteThisPerson.name} has been already been removed from server`)
            setPersons(persons.filter(person => person.id !== id))
            setTimeout(() => setErrorMessage(''), 3000)
          } else {
            console.warn('Error deleting person', error)
            setErrorMessage(`Error deleting ${deleteThisPerson.name}`)
            setTimeout(() => setErrorMessage(''), 3000)
          }
        })
    }
  }

  const Notification = ({ message, errorMessage }) => {
    if (!message && !errorMessage) {
      return null
    }
    return (
      <div className={errorMessage ? 'error' : 'success'}>
        {message || errorMessage}
      </div>
    )
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={successMessage} errorMessage={errorMessage} />
      <Filter filtered={filtered} setFiltered={setFiltered} />
      <h2>add a new</h2>
      <PersonForm
        addName={addName}
        setNewName={setNewName}
        setNewNumber={setNewNumber}
        newName={newName}
        newNumber={newNumber} />
      <h2>Numbers</h2>
      <PersonList persons={filteredPersons} deletePerson={deletePerson} />
    </div>
  )
}


export default App