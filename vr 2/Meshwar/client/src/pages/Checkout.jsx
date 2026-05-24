import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'

const Checkout = () => {
    const { id } = useParams()
    const { cars, axios, pickupDate, returnDate, currency, user, fetchUser, token } = useAppContext()
    const navigate = useNavigate()

    const [car, setCar] = useState(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [focusedField, setFocusedField] = useState(null)
    const [billingCycle, setBillingCycle] = useState('monthly')
    const [paymentMethod, setPaymentMethod] = useState('Credit Card')
    const [selectedPlan, setSelectedPlan] = useState('standard')
    const [pickupLocation, setPickupLocation] = useState('')
    const [returnLocation, setReturnLocation] = useState('')
    const [calculatedPrice, setCalculatedPrice] = useState(null)
    const [isCalculating, setIsCalculating] = useState(false)

    const [formData, setFormData] = useState({
        email: '', name: '', address: '', city: '', zip: '', cardNumber: '', expiry: '', cvc: '', phone: ''
    })

    const isPremiumCheckout = id === 'premium'

    const plans = {
        standard: {
            name: 'Standard',
            price: billingCycle === 'monthly' ? 99 : 990,
            features: ['Owner Dashboard', 'Basic Analytics', '10 Car Listings', 'Email Support'],
            description: 'Perfect for individual owners starting out.',
            color: 'gray'
        },
        professional: {
            name: 'Professional',
            price: billingCycle === 'monthly' ? 199 : 1990,
            features: ['Owner Dashboard', 'Real-time Analytics', 'Unlimited Listings', 'Priority 24/7 Support', 'Insurance Assistance', 'Performance Reports'],
            description: 'Advanced tools for professional fleet managers.',
            color: 'primary'
        }
    }

    useEffect(() => {
        if (isPremiumCheckout) {
            const plan = plans[selectedPlan]
            setCar({
                brand: 'Meshwar', model: `${plan.name} Plan`, pricePerDay: plan.price,
                image: selectedPlan === 'standard' ? 'plan_standard' : 'plan_professional',
                category: 'Membership'
            })
        } else {
            if (!token) {
                toast.error('Please login to book a car.');
                navigate('/');
                return;
            }
            if (!user) {
                // Wait for user details to load
                return;
            }

            const requiredFields = ['phone', 'idNumber', 'licenseNumber', 'job', 'nationality', 'gender'];
            const missingFields = requiredFields.filter(f => !user[f] || user[f] === 'Not Selected');
            
            const missingDocs = [];
            if (!user.idCardFront) missingDocs.push('ID Card (Front)');
            if (!user.idCardBack) missingDocs.push('ID Card (Back)');
            if (!user.licenseFront) missingDocs.push('License (Front)');
            if (!user.licenseBack) missingDocs.push('License (Back)');

            if (missingFields.length > 0 || missingDocs.length > 0) {
                let errorMsg = '';
                if (missingFields.length > 0) {
                    errorMsg += `Missing fields: ${missingFields.join(', ')}. `;
                }
                if (missingDocs.length > 0) {
                    errorMsg += `Missing documents: ${missingDocs.join(', ')}.`;
                }
                toast.error(`Please complete your profile first. ${errorMsg}`);
                navigate('/my-account');
                return;
            }

            if (user.verificationStatus !== 'verified') {
                if (user.verificationStatus === 'pending') {
                    toast.error('Your verification is currently in progress. Please wait for the AI review to complete.');
                } else if (user.verificationStatus === 'rejected') {
                    toast.error(`Your identity verification was rejected: ${user.verificationError || 'Invalid details'}. Please update details/documents.`);
                } else {
                    toast.error('Please complete identity verification under "My Account" before booking.');
                }
                navigate('/my-account');
                return;
            }

            if (!pickupDate || !returnDate) {
                toast.error('Please select pickup and return dates first.')
                navigate(`/car-details/${id}`)
                return;
            }
            const selectedCar = cars.find(c => c._id === id)
            if (selectedCar) setCar(selectedCar)
        }
    }, [cars, id, pickupDate, returnDate, navigate, isPremiumCheckout, billingCycle, selectedPlan, user, token])

    useEffect(() => {
        const fetchPrice = async () => {
            if (!isPremiumCheckout && car && pickupDate && returnDate) {
                setIsCalculating(true);
                try {
                    const { data } = await axios.post('/api/pricing/calculate', {
                        carId: id,
                        pickupDate,
                        returnDate
                    });
                    if (data.success) {
                        setCalculatedPrice(data.pricing);
                    }
                } catch (error) {
                    console.error("Error calculating price in Checkout:", error);
                } finally {
                    setIsCalculating(false);
                }
            } else {
                setCalculatedPrice(null);
            }
        };

        fetchPrice();
    }, [isPremiumCheckout, car, pickupDate, returnDate, id, axios]);

    const days = isPremiumCheckout ? 1 : (() => {
        if (!pickupDate || !returnDate) return 0
        const start = new Date(pickupDate)
        const end = new Date(returnDate)
        const diff = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24))
        return diff === 0 ? 1 : diff
    })()

    const total = car 
        ? (isPremiumCheckout 
            ? car.pricePerDay 
            : (calculatedPrice ? calculatedPrice.totalPrice : car.pricePerDay * days)
          ) 
        : 0;
    const taxes = isPremiumCheckout ? 0 : Math.round(total * 0.1)
    const grandTotal = total + taxes

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        if (name === 'cardNumber') value = value.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || value.replace(/\D/g, '');
        if (name === 'expiry') value = value.replace(/\D/g, '').replace(/^(\d{2})/, '$1/').slice(0, 5);
        if (name === 'cvc') value = value.replace(/\D/g, '').slice(0, 3);
        setFormData({ ...formData, [name]: value })
    }

    const handlePayment = async (e, method = 'Credit Card') => {
        if (e) e.preventDefault();
        setLoading(true)
        await new Promise(r => setTimeout(r, 1500))
        try {
            const endpoint = isPremiumCheckout ? '/api/user/upgrade-premium' : '/api/bookings/create'
            const payload = isPremiumCheckout ? { paymentMethod: method, billingCycle, plan: selectedPlan } : { car: id, pickupDate, returnDate, paymentMethod: method, pickupLocation, returnLocation }
            const { data } = await axios.post(endpoint, payload, { headers: { Authorization: token } })
            if (data.success) {
                setSuccess(true)
                await fetchUser()
                setTimeout(() => { navigate(isPremiumCheckout ? '/owner' : '/my-bookings'); toast.success(data.message || 'Payment Successful!') }, 2000)
            } else { toast.error(data.message); setLoading(false) }
        } catch (e) { toast.error(e.message); setLoading(false) }
    }

    if (!car) return <Loader />

    return (
        <div className='min-h-screen bg-gray-50/50 text-gray-900 font-sans selection:bg-primary/20 selection:text-primary pb-20'>
            {/* Sleek Header */}
            <nav className='sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 md:px-12 py-4 flex justify-between items-center'>
                <button onClick={() => navigate(-1)} className='group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors'>
                    <svg className='w-4 h-4 transition-transform group-hover:-translate-x-1' fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    Back
                </button>
                <div className='flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full border border-gray-200'>
                    <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
                    <span className='text-xs font-bold text-gray-700 tracking-wide uppercase'>Secure Checkout</span>
                </div>
            </nav>

            <div className='max-w-6xl mx-auto px-6 md:px-12 py-10'>
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16'>

                    <div className='lg:col-span-7 space-y-12'>

                        {isPremiumCheckout && (
                            <section className='space-y-10'>
                                <div className='space-y-4'>
                                    <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900'>
                                        Choose your <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500'>plan</span>
                                    </h1>
                                    <p className='text-gray-500 text-lg max-w-lg'>
                                        Unlock the full potential of your fleet. Get access to advanced analytics, priority support, and unlimited listings.
                                    </p>
                                </div>

                                <div className='flex items-center'>
                                    <div className='relative inline-flex items-center p-1 bg-gray-200/80 rounded-2xl'>
                                        <button onClick={() => setBillingCycle('monthly')} className={`relative w-32 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${billingCycle === 'monthly' ? 'text-gray-900 shadow-md bg-white' : 'text-gray-500 hover:text-gray-900'}`}>
                                            Monthly
                                        </button>
                                        <button onClick={() => setBillingCycle('annual')} className={`relative w-32 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${billingCycle === 'annual' ? 'text-gray-900 shadow-md bg-white' : 'text-gray-500 hover:text-gray-900'}`}>
                                            Annual
                                            <span className='absolute -top-3 -right-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm'>Save 17%</span>
                                        </button>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    {Object.entries(plans).map(([key, plan]) => (
                                        <PricingCard key={key} plan={plan} billingCycle={billingCycle} active={selectedPlan === key} onClick={() => setSelectedPlan(key)} currency={currency} isPopular={key === 'professional'} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Pickup & Return Location — Step 1 (car bookings only) */}
                        {!isPremiumCheckout && (
                            <section className='space-y-6'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold'>1</div>
                                    <h2 className='text-xl font-bold text-gray-900'>Pickup & Return Location</h2>
                                </div>

                                <div className='bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-5'>
                                    <p className='text-sm text-gray-500 font-medium'>Propose where you'd like to pick up and return the car. The owner will review your proposed locations.</p>

                                    {/* Pickup Location */}
                                    <div className='relative'>
                                        <div className='absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none'>
                                            <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                                <path strokeLinecap='round' strokeLinejoin='round' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                            </svg>
                                        </div>
                                        <input
                                            type='text'
                                            required
                                            value={pickupLocation}
                                            onChange={e => setPickupLocation(e.target.value)}
                                            placeholder='Pickup: e.g. Mall of Arabia — Parking B'
                                            className='w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-semibold transition-all placeholder:font-medium placeholder:text-gray-400'
                                        />
                                    </div>

                                    {/* Return Location */}
                                    <div className='relative'>
                                        <div className='absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none'>
                                            <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                                <path strokeLinecap='round' strokeLinejoin='round' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                            </svg>
                                        </div>
                                        <input
                                            type='text'
                                            required
                                            value={returnLocation}
                                            onChange={e => setReturnLocation(e.target.value)}
                                            placeholder='Return: e.g. Cairo Airport — Terminal 2'
                                            className='w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-semibold transition-all placeholder:font-medium placeholder:text-gray-400'
                                        />
                                    </div>

                                    <div className='flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100'>
                                        <svg className='w-4 h-4 text-amber-500 shrink-0 mt-0.5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
                                        <p className='text-xs text-amber-700 font-semibold'>The car owner will review your proposed locations when approving your booking.</p>
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className='space-y-6'>
                            <div className='flex items-center gap-3'>
                                <div className='w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold'>{isPremiumCheckout ? '2' : '2'}</div>
                                <h2 className='text-xl font-bold text-gray-900'>Payment Method</h2>
                            </div>

                            <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                                <MethodTab icon="card" label="Card" active={paymentMethod === 'Credit Card'} onClick={() => setPaymentMethod('Credit Card')} />
                                <MethodTab icon="apple" label="Apple" active={paymentMethod === 'Apple Pay'} onClick={() => setPaymentMethod('Apple Pay')} />
                                <MethodTab icon="instapay" label="InstaPay" active={paymentMethod === 'InstaPay'} onClick={() => setPaymentMethod('InstaPay')} />
                                <MethodTab icon="vodafone" label="Vodafone" active={paymentMethod === 'Vodafone Cash'} onClick={() => setPaymentMethod('Vodafone Cash')} />
                                <MethodTab icon="wallet" label="Wallet" active={paymentMethod === 'Wallet'} onClick={() => setPaymentMethod('Wallet')} />
                            </div>

                            <AnimatePresence mode='wait'>
                                {paymentMethod === 'Credit Card' && (
                                    <motion.form key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={(e) => handlePayment(e)} className='bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6'>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                            <FloatingInput label="Full Name" name="name" value={formData.name} onChange={handleInputChange} focused={focusedField === 'name'} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} />
                                            <FloatingInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} focused={focusedField === 'email'} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} />
                                        </div>
                                        <div className='space-y-4'>
                                            <div className='relative'>
                                                <input type="tel" name="cardNumber" required placeholder="Card Number" value={formData.cardNumber} onChange={handleInputChange} className='w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-base font-semibold tracking-widest transition-all' />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                                                    <svg className="w-8 h-auto opacity-50" viewBox="0 0 38 24" fill="none"><rect width="38" height="24" rx="4" fill="#E5E7EB" /><circle cx="14" cy="12" r="6" fill="#EF4444" fillOpacity="0.8" /><circle cx="24" cy="12" r="6" fill="#F59E0B" fillOpacity="0.8" /></svg>
                                                </div>
                                            </div>
                                            <div className='flex gap-4'>
                                                <input type="tel" name="expiry" required placeholder="MM / YY" value={formData.expiry} onChange={handleInputChange} className='w-1/2 px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-base font-semibold text-center transition-all' />
                                                <input type="tel" name="cvc" required placeholder="CVC" value={formData.cvc} onChange={handleInputChange} className='w-1/2 px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-base font-semibold text-center transition-all' />
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <SubmitBtn loading={loading} success={success} total={grandTotal} currency={currency} isPremium={isPremiumCheckout} disabled={isCalculating} />
                                        </div>
                                    </motion.form>
                                )}

                                {(paymentMethod === 'InstaPay' || paymentMethod === 'Vodafone Cash') && (
                                    <motion.div key="mobile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className='bg-white border border-gray-200 rounded-3xl p-10 shadow-sm text-center space-y-8'>
                                        <div className='relative w-20 h-20 mx-auto'>
                                            <div className={`relative w-full h-full rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg ${paymentMethod === 'Vodafone Cash' ? 'bg-red-500 shadow-red-500/30' : 'bg-purple-600 shadow-purple-600/30'}`}>
                                                {paymentMethod === 'Vodafone Cash' ? 'VF' : 'IP'}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-sm font-semibold text-gray-500">Enter your registered mobile number</p>
                                            <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className='w-full max-w-sm mx-auto block px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-center font-bold text-xl tracking-widest transition-all' placeholder='01X XXXX XXXX' />
                                        </div>
                                        <SubmitBtn onClick={() => handlePayment(null, paymentMethod)} loading={loading} success={success} total={grandTotal} currency={currency} isPremium={isPremiumCheckout} disabled={isCalculating} />
                                    </motion.div>
                                )}

                                {paymentMethod === 'Apple Pay' && (
                                    <motion.div key="apple" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className='bg-black rounded-3xl p-6 text-center cursor-pointer hover:scale-[0.98] transition-all shadow-xl shadow-black/20' onClick={() => handlePayment(null, 'Apple Pay')}>
                                        <div className='flex items-center justify-center gap-2 text-white h-12'>
                                            <svg className="w-8 h-8" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
                                            <span className='text-2xl font-bold tracking-tight'>Pay</span>
                                        </div>
                                    </motion.div>
                                )}

                                {paymentMethod === 'Wallet' && (
                                    <motion.div key="wallet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className='bg-white border border-gray-200 rounded-3xl p-10 shadow-sm text-center space-y-8'>
                                        <div className='space-y-3'>
                                            <div className='w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600'>
                                                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v.5M4 6v12c0 1.1.9 2 2 2h14v-4M16 16h4M20 12v4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                            <h3 className='text-xl font-bold text-gray-900'>Pay with Wallet</h3>
                                            <p className='text-sm text-gray-500'>Use your internal balance for a seamless 1-click checkout.</p>
                                        </div>

                                        <div className='bg-gray-50 rounded-2xl p-6 border border-gray-100 max-w-sm mx-auto'>
                                            <span className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Available Balance</span>
                                            <div className='text-4xl font-extrabold text-gray-900 mt-2'>{(user?.wallet || 0).toLocaleString()} <span className='text-lg text-gray-500 font-medium'>{currency}</span></div>
                                        </div>

                                        {user?.wallet < grandTotal ? (
                                            <div className='p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3 text-left max-w-sm mx-auto'>
                                                <svg className='w-5 h-5 text-red-500 shrink-0' fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                <p className='text-sm font-semibold text-red-700'>Insufficient Balance. Please top up your wallet to use this method.</p>
                                            </div>
                                        ) : (
                                            <SubmitBtn onClick={() => handlePayment(null, 'Wallet')} loading={loading} success={success} total={grandTotal} currency={currency} isPremium={isPremiumCheckout} disabled={isCalculating} />
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </section>
                    </div>

                    {/* Right Sidebar */}
                    <div className='lg:col-span-5'>
                        <div className='sticky top-28 space-y-6'>
                            <div className='relative bg-white border border-gray-200 rounded-[2rem] shadow-xl shadow-gray-200/40 overflow-hidden'>
                                {/* Decorative Top Line */}
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />

                                <div className='p-8'>
                                    <h3 className='text-xl font-extrabold text-gray-900 mb-8 flex items-center gap-2'>
                                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                        Order Summary
                                    </h3>

                                    <div className='flex gap-5 items-start mb-8'>
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md shrink-0 border border-gray-100 flex items-center justify-center group">
                                            {car.image === 'plan_professional' ? (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                                                    <svg className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.8-6.3 4.8 2.3-7.4-6-4.6h7.6z" /></svg>
                                                </div>
                                            ) : car.image === 'plan_standard' ? (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                                                    <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.8-6.3 4.8 2.3-7.4-6-4.6h7.6z" /></svg>
                                                </div>
                                            ) : (
                                                <img src={car.image} alt={car.model} className='w-full h-full object-cover transition-transform hover:scale-110 duration-500' />
                                            )}
                                            <div className="absolute inset-0 bg-black/5 ring-1 ring-inset ring-black/10 rounded-2xl pointer-events-none" />
                                        </div>
                                        <div className='space-y-2 pt-1'>
                                            <h4 className='font-bold text-lg text-gray-900 leading-tight'>{car.brand} {car.model}</h4>
                                            <span className='inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg uppercase tracking-widest'>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                {car.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='space-y-4 pt-6 border-t border-gray-200 border-dashed'>
                                        <SummaryRow label={isPremiumCheckout ? "Billing Cycle" : "Duration"} value={isPremiumCheckout ? (billingCycle === 'monthly' ? 'Monthly' : 'Annually') : `${days} Days`} />
                                        
                                        {!isPremiumCheckout && calculatedPrice?.breakdown ? (
                                            <>
                                                <SummaryRow label="Base Rate" value={`${(car.pricePerDay * days).toLocaleString()} ${currency}`} />
                                                
                                                {calculatedPrice.breakdown.seasonName && (
                                                    <div className={`flex justify-between items-center text-xs ${calculatedPrice.breakdown.seasonalMultiplier > 1 ? 'text-orange-500' : 'text-green-600'}`}>
                                                        <span className='flex items-center gap-1.5'>
                                                            {calculatedPrice.breakdown.seasonalMultiplier > 1 ? '☀️' : '❄️'} {calculatedPrice.breakdown.seasonName}
                                                        </span>
                                                        <span className='font-bold'>
                                                            {calculatedPrice.breakdown.seasonalMultiplier > 1 ? '+' : '-'}{Math.abs(Math.round((calculatedPrice.breakdown.seasonalMultiplier - 1) * 100))}%
                                                        </span>
                                                    </div>
                                                )}

                                                {calculatedPrice.breakdown.demandMultiplier !== 1 && (
                                                    <div className={`flex justify-between items-center text-xs ${calculatedPrice.breakdown.demandMultiplier > 1 ? 'text-orange-500' : 'text-green-600'}`}>
                                                        <span className='flex items-center gap-1.5'>
                                                            {calculatedPrice.breakdown.demandMultiplier > 1 ? '📈' : '📉'} {calculatedPrice.breakdown.demandLabel}
                                                        </span>
                                                        <span className='font-bold'>
                                                            {calculatedPrice.breakdown.demandMultiplier > 1 ? '+' : '-'}{Math.abs(Math.round((calculatedPrice.breakdown.demandMultiplier - 1) * 100))}%
                                                        </span>
                                                    </div>
                                                )}

                                                {calculatedPrice.breakdown.carFeatureMultiplier !== 1 && (
                                                    <div className='flex justify-between items-center text-xs text-green-600'>
                                                        <span className='flex items-center gap-1.5'>
                                                            📉 {calculatedPrice.breakdown.carFeatureLabel}
                                                        </span>
                                                        <span className='font-bold'>
                                                            -{Math.round((1 - calculatedPrice.breakdown.carFeatureMultiplier) * 100)}%
                                                        </span>
                                                    </div>
                                                )}

                                                {calculatedPrice.breakdown.weekendDays > 0 && (
                                                    <div className='flex justify-between items-center text-xs text-orange-500'>
                                                        <span className='flex items-center gap-1.5'>
                                                            📅 Weekend Rate ({calculatedPrice.breakdown.weekendDays} days)
                                                        </span>
                                                        <span className='font-bold'>+15%</span>
                                                    </div>
                                                )}
                                                
                                                {calculatedPrice.breakdown.weekdayDays > 0 && calculatedPrice.breakdown.seasonalMultiplier === 1.0 && calculatedPrice.breakdown.demandMultiplier <= 1.0 && (
                                                    <div className='flex justify-between items-center text-xs text-green-600'>
                                                        <span className='flex items-center gap-1.5'>
                                                            📉 Normal Weekday ({calculatedPrice.breakdown.weekdayDays} days)
                                                        </span>
                                                        <span className='font-bold'>-20%</span>
                                                    </div>
                                                )}

                                                {calculatedPrice.breakdown.durationDiscount !== 1 && (
                                                    <div className='flex justify-between items-center text-xs text-green-600'>
                                                        <span className='flex items-center gap-1.5'>
                                                            📉 Long-Term Discount
                                                        </span>
                                                        <span className='font-bold'>-{Math.round((1 - calculatedPrice.breakdown.durationDiscount) * 100)}%</span>
                                                    </div>
                                                )}

                                                {calculatedPrice.breakdown.capped && (
                                                    <div className='flex justify-between items-center text-xs text-blue-600 bg-blue-50/50 p-2 rounded-lg'>
                                                        <span className='flex items-center gap-1.5 font-semibold'>
                                                            🛡️ Price Protection Applied
                                                        </span>
                                                        <span className='font-bold'>
                                                            {calculatedPrice.breakdown.capped === "max" ? "Capped at +15%" : "Capped at -15%"}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                <div className='h-px bg-gray-100 my-1' />
                                                <SummaryRow label="Adjusted Subtotal" value={`${calculatedPrice.totalPrice.toLocaleString()} ${currency}`} />
                                            </>
                                        ) : (
                                            <SummaryRow label={isPremiumCheckout ? "Plan Rate" : "Daily Rate"} value={`${(car.pricePerDay || 0).toLocaleString()} ${currency}`} />
                                        )}

                                        {taxes > 0 && <SummaryRow label="Taxes & Fees" value={`${taxes.toLocaleString()} ${currency}`} />}
                                    </div>
                                </div>

                                {/* Total Box */}
                                <div className='bg-gray-50/80 p-8 border-t border-gray-100'>
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <span className='text-sm font-bold text-gray-500 block mb-1'>Total due today</span>
                                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Includes all applicable taxes</span>
                                        </div>
                                        <div className='text-right'>
                                            <div className='text-4xl font-black text-gray-900 tracking-tight flex items-baseline justify-end gap-1.5'>
                                                {grandTotal.toLocaleString()}
                                                <span className='text-lg font-bold text-gray-500'>{currency}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badge */}
                            <div className='bg-white border border-gray-200 rounded-[1.5rem] p-5 flex items-center gap-4 shadow-sm'>
                                <div className="bg-emerald-50 p-3 rounded-xl shrink-0 text-emerald-600">
                                    <svg className='w-6 h-6' fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <div>
                                    <p className='text-sm font-bold text-gray-900 tracking-wide'>Bank-Grade Security</p>
                                    <p className='text-xs text-gray-500 font-medium mt-0.5'>Your payment is 256-bit SSL encrypted</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const PricingCard = ({ plan, active, onClick, currency, isPopular, billingCycle }) => (
    <motion.div
        whileHover={{ y: -4 }}
        onClick={onClick}
        className={`relative p-8 rounded-[2rem] transition-all duration-300 cursor-pointer overflow-hidden ${active ? 'bg-white shadow-2xl shadow-emerald-500/10 ring-2 ring-emerald-500' : 'bg-white hover:bg-gray-50 ring-1 ring-gray-200 shadow-sm'}`}
    >
        {isPopular && (
            <div className="absolute top-0 inset-x-0 flex justify-center">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1 rounded-b-xl shadow-sm">
                    Most Popular
                </div>
            </div>
        )}

        {active && <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />}

        <div className="relative z-10 mt-2">
            <h3 className={`text-xl font-extrabold ${active ? 'text-emerald-600' : 'text-gray-900'}`}>{plan.name}</h3>
            <p className='text-sm mt-2 text-gray-500 font-medium'>{plan.description}</p>

            <div className='mt-6 mb-8 flex items-baseline gap-1'>
                <span className={`text-4xl font-black tracking-tighter ${active ? 'text-gray-900' : 'text-gray-900'}`}>
                    {plan.price.toLocaleString()}
                </span>
                <span className='text-sm font-bold text-gray-400'>{currency} <span className="font-medium">/ {billingCycle === 'annual' ? 'yr' : 'mo'}</span></span>
            </div>

            <div className="h-px w-full bg-gray-100 mb-8" />

            <ul className='space-y-4'>
                {plan.features.map((f, i) => (
                    <li key={i} className='flex items-start gap-3'>
                        <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className='text-sm font-semibold text-gray-600'>{f}</span>
                    </li>
                ))}
            </ul>
        </div>
    </motion.div>
)

const MethodTab = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${active ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'}`}>
        <div className='h-6 flex items-center justify-center'>
            {icon === 'card' && <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
            {icon === 'apple' && <svg width="24" height="24" fill="currentColor" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>}
            {icon === 'instapay' && <div className='text-xs font-black'>IP</div>}
            {icon === 'vodafone' && <div className='text-xs font-black'>VF</div>}
            {icon === 'wallet' && <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v.5M4 6v12c0 1.1.9 2 2 2h14v-4M16 16h4M20 12v4" /></svg>}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-emerald-700' : 'text-gray-500'}`}>{label}</span>
    </button>
)

const FloatingInput = ({ label, name, type = "text", value, onChange, focused, onFocus, onBlur }) => (
    <div className='relative'>
        <input type={type} name={name} required value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur} className='w-full px-5 pt-6 pb-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-semibold transition-all peer' placeholder=' ' />
        <label className={`absolute left-5 transition-all pointer-events-none ${(focused || value) ? 'top-2 text-[10px] text-emerald-600 font-bold uppercase tracking-wider' : 'top-4 text-sm font-semibold text-gray-400'}`}>{label}</label>
    </div>
)

const SummaryRow = ({ label, value }) => (
    <div className='flex justify-between items-center'>
        <span className='text-sm font-medium text-gray-500'>{label}</span>
        <span className='text-sm font-bold text-gray-900'>{value}</span>
    </div>
)

const SubmitBtn = ({ loading, success, total, currency, onClick, isPremium, disabled }) => (
    <button
        type={onClick ? 'button' : 'submit'}
        onClick={onClick}
        disabled={loading || success || disabled}
        className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide text-white transition-all relative overflow-hidden group shadow-lg
            ${success
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-gray-900 hover:bg-gray-800 shadow-gray-900/20 active:scale-[0.98]'
            }
            ${loading || success || disabled ? 'cursor-default opacity-90' : 'cursor-pointer'}
        `}
    >
        {/* Subtle shine effect on hover */}
        {!loading && !success && !disabled && <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-[30deg] -translate-x-[200%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />}

        <div className='flex items-center justify-center gap-2 relative z-10'>
            {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : success ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            )}
            <span>
                {loading ? 'Processing Transaction...' : success ? 'Payment Successful' : total ? (isPremium ? `Subscribe for ${total.toLocaleString()} ${currency}` : `Pay ${total.toLocaleString()} ${currency}`) : 'Confirm Payment'}
            </span>
        </div>
    </button>
)

export default Checkout
