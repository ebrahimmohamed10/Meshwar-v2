import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY

    const [token, setToken] = useState(localStorage.getItem('token'))

    // Set immediate authorization header if token exists
    if (token) {
        axios.defaults.headers.common['Authorization'] = `${token}`
    }
    const [user, setUser] = useState(null)
    const [isOwner, setIsOwner] = useState(false)
    const [isPremium, setIsPremium] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [pickupDate, setPickupDate] = useState('')
    const [returnDate, setReturnDate] = useState('')

    const [cars, setCars] = useState([])

    // Function to check if user is logged in
    const fetchUser = async () => {
        try {
            const { data } = await axios.get('/api/user/data')
            if (data.success) {
                setUser(data.user)
                setIsOwner(data.user.role === 'owner')
                setIsPremium(data.user.isPremium)
            } else {
                navigate('/')
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    // Function to fetch all cars from the server

    const fetchCars = async () => {
        try {
            const { data } = await axios.get('/api/user/cars')
            data.success ? setCars(data.cars || []) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to log out the user
    const logout = () => {
        setIsLoggingOut(true)
        setTimeout(() => {
            localStorage.removeItem('token')
            setToken(null)
            setUser(null)
            setIsOwner(false)
            setIsPremium(false)
            axios.defaults.headers.common['Authorization'] = ''
            setIsLoggingOut(false)
            toast.success('You have been logged out')
            navigate('/')
        }, 2000)
    }


    // Set axios headers and fetch initial data
    useEffect(() => {
        fetchCars()
        if (token) {
            axios.defaults.headers.common['Authorization'] = `${token}`
            fetchUser()
        }
    }, [token])

    const value = {
        navigate, currency, axios, user, setUser,
        token, setToken, isOwner, setIsOwner, isPremium, setIsPremium, fetchUser, showLogin, setShowLogin, logout, fetchCars, cars, setCars,
        pickupDate, setPickupDate, returnDate, setReturnDate, isLoggingOut
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    return useContext(AppContext)
}