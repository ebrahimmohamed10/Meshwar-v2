import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'motion/react'
import ReactMarkdown from 'react-markdown'

const MyAccount = () => {

    const { user, axios, fetchUser } = useAppContext()
    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)
    const [idCardFront, setIdCardFront] = useState(false)
    const [idCardBack, setIdCardBack] = useState(false)
    const [licenseFront, setLicenseFront] = useState(false)
    const [licenseBack, setLicenseBack] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [showReport, setShowReport] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        gender: '',
        dob: '',
        nationality: '',
        idNumber: '',
        emergencyContact: '',
        job: '',
        licenseNumber: '',
        licenseExpiry: '',
        city: '',
        zipCode: '',
        country: ''
    })

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                gender: user.gender || 'Not Selected',
                dob: user.dob || '',
                nationality: user.nationality || '',
                idNumber: user.idNumber || '',
                emergencyContact: user.emergencyContact || '',
                job: user.job || '',
                licenseNumber: user.licenseNumber || '',
                licenseExpiry: user.licenseExpiry || '',
                city: user.city || '',
                zipCode: user.zipCode || '',
                country: user.country || ''
            })
        }
    }, [user])

    const updateProfileData = async () => {
        try {
            const formDataToSubmit = new FormData();
            Object.keys(formData).forEach(key => {
                formDataToSubmit.append(key, formData[key]);
            });

            if (image) formDataToSubmit.append('image', image);
            if (idCardFront) formDataToSubmit.append('idCardFront', idCardFront);
            if (idCardBack) formDataToSubmit.append('idCardBack', idCardBack);
            if (licenseFront) formDataToSubmit.append('licenseFront', licenseFront);
            if (licenseBack) formDataToSubmit.append('licenseBack', licenseBack);

            const { data } = await axios.put('/api/user/update-profile', formDataToSubmit);

            if (data.success) {
                toast.success(data.message);
                await fetchUser();
                setIsEdit(false);
                setImage(false);
                setIdCardFront(false);
                setIdCardBack(false);
                setLicenseFront(false);
                setLicenseBack(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleVerifyProfile = async () => {
        try {
            setIsVerifying(true)
            toast.loading("Initiating AI Profile Verification...", { id: "verify-loading" })
            const { data } = await axios.post('/api/user/verify-profile')
            toast.dismiss("verify-loading")
            if (data.success) {
                toast.success(data.message)
                await fetchUser()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.dismiss("verify-loading")
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsVerifying(false)
        }
    }

    if (!user) {
        return (
            <div className='min-h-[60vh] flex items-center justify-center'>
                <p className='text-gray-400'>Loading your profile...</p>
            </div>
        )
    }

    const hasAllDocs = !!(user.idCardFront && user.idCardBack && user.licenseFront && user.licenseBack);
    const hasAllDetails = !!(user.name && user.name.trim() !== '' && 
        user.dob && user.dob !== 'Not Selected' && user.dob !== '' &&
        user.idNumber && user.idNumber !== 'Not Selected' && user.idNumber !== '' &&
        user.licenseNumber && user.licenseNumber !== 'Not Selected' && user.licenseNumber !== '');
    const isReadyForVerification = hasAllDocs && hasAllDetails;
    
    const verificationStatus = isVerifying ? 'pending' : (user.verificationStatus || 'unverified');

    return (
        <div className='max-w-5xl mx-auto px-6 py-12 md:py-16'>
            
            {/* Page Header */}
            <div className='mb-12 text-center md:text-left'>
                <h1 className='text-3xl font-bold text-gray-900'>My Account</h1>
                <p className='text-gray-500 mt-1 font-medium'>View and manage your personal identity details.</p>
            </div>

            {/* Verification Status Card */}
            <div className='mb-10 bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden'>
                <div className='p-8 md:p-10'>
                    {verificationStatus === 'verified' && (
                        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
                            <div className='flex items-start gap-4'>
                                <div className='p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100'>
                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className='text-lg font-bold text-gray-900'>Profile Verified</h3>
                                    <p className='text-gray-500 text-sm mt-0.5'>All uploaded documents have been successfully validated and match your details.</p>
                                </div>
                            </div>
                            {user.verificationReport && (
                                <button onClick={() => setShowReport(!showReport)} className='text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 px-5 py-2.5 rounded-xl transition-all cursor-pointer'>
                                    {showReport ? 'Hide Verification Audit' : 'View Verification Audit'}
                                </button>
                            )}
                        </div>
                    )}

                    {verificationStatus === 'rejected' && (
                        <div className='space-y-6'>
                            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
                                <div className='flex items-start gap-4'>
                                    <div className='p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100'>
                                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className='text-lg font-bold text-gray-900'>Verification Rejected</h3>
                                        <p className='text-rose-600 text-sm font-semibold mt-1'>{user.verificationError || 'Verification checks failed.'}</p>
                                        <p className='text-gray-500 text-xs mt-0.5'>Please review your documents and update details before trying again.</p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-3'>
                                    {user.verificationReport && (
                                        <button onClick={() => setShowReport(!showReport)} className='text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-5 py-2.5 rounded-xl transition-all cursor-pointer'>
                                            {showReport ? 'Hide Audit Log' : 'View Audit Log'}
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleVerifyProfile}
                                        disabled={!isReadyForVerification} 
                                        className={`text-xs font-black uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer ${isReadyForVerification ? 'bg-primary text-white hover:bg-primary/95' : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}
                                    >
                                        Retry Verification
                                    </button>
                                </div>
                            </div>
                            {!isReadyForVerification && (
                                <div className='p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium flex items-center gap-2'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse' />
                                    Please ensure all profile details are completed and all 4 documents are uploaded before retrying.
                                </div>
                            )}
                        </div>
                    )}

                    {verificationStatus === 'pending' && (
                        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
                            <div className='flex items-start gap-4'>
                                <div className='p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 flex items-center justify-center relative'>
                                    <div className='absolute inset-0 rounded-2xl bg-amber-400/20 animate-ping' />
                                    <svg className='animate-spin' width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className='text-lg font-bold text-gray-900'>Verification in Progress</h3>
                                    <p className='text-gray-500 text-sm mt-0.5'>Llama 4 Vision is currently auditing your identity documents against your details.</p>
                                    <p className='text-amber-600 text-xs font-semibold mt-1 animate-pulse'>This process typically takes 10-15 seconds. Please do not close this page.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {verificationStatus === 'unverified' && (
                        <div className='space-y-0'>
                            {/* Main verification card with gradient */}
                            <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 p-8 md:p-10'>
                                {/* Decorative background elements */}
                                <div className='absolute top-0 right-0 w-64 h-64 bg-emerald-300/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none' />
                                <div className='absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none' />
                                
                                <div className='relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
                                    <div className='flex items-start gap-5'>
                                        {/* Shield icon */}
                                        <div className='relative'>
                                            <div className='absolute inset-0 bg-primary/30 rounded-2xl blur-xl' />
                                            <div className='relative p-4 bg-gradient-to-br from-primary to-emerald-400 rounded-2xl shadow-lg shadow-primary/25'>
                                                <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className='text-xl font-bold text-white'>Verify Your Identity</h3>
                                            <p className='text-emerald-300/70 text-sm mt-1.5 max-w-md leading-relaxed'>
                                                Complete a quick identity check to unlock full access — book any car, earn trust badges, and enjoy faster checkouts.
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={isReadyForVerification ? { scale: 1.04 } : {}}
                                        whileTap={isReadyForVerification ? { scale: 0.96 } : {}}
                                        onClick={handleVerifyProfile}
                                        disabled={!isReadyForVerification}
                                        className={`shrink-0 text-xs font-black uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${isReadyForVerification ? 'bg-gradient-to-r from-primary to-emerald-400 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40' : 'bg-white/10 text-emerald-700 cursor-not-allowed border border-white/10'}`}
                                    >
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                        </svg>
                                        Start Verification
                                    </motion.button>
                                </div>
                            </div>

                            {/* Requirements checklist */}
                            {!isReadyForVerification && (
                                <div className='mt-5 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl'>
                                    <div className='flex items-center gap-2.5 mb-4'>
                                        <div className='p-1.5 bg-amber-100 rounded-lg'>
                                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className='text-amber-600'>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                            </svg>
                                        </div>
                                        <p className='text-sm font-bold text-amber-800'>Almost there! Complete these steps first:</p>
                                    </div>
                                    <div className='space-y-3 pl-1'>
                                        {!hasAllDetails && (
                                            <div className='flex items-start gap-3'>
                                                <div className='mt-0.5 w-5 h-5 rounded-full border-2 border-amber-300 bg-white flex items-center justify-center shrink-0'>
                                                    <span className='text-[10px] font-black text-amber-500'>1</span>
                                                </div>
                                                <p className='text-sm text-amber-900/80 font-medium'>Fill in your <span className='font-bold text-amber-900'>Full Name</span>, <span className='font-bold text-amber-900'>Date of Birth</span>, <span className='font-bold text-amber-900'>National ID</span>, and <span className='font-bold text-amber-900'>License Number</span> in your profile.</p>
                                            </div>
                                        )}
                                        {!hasAllDocs && (
                                            <div className='flex items-start gap-3'>
                                                <div className='mt-0.5 w-5 h-5 rounded-full border-2 border-amber-300 bg-white flex items-center justify-center shrink-0'>
                                                    <span className='text-[10px] font-black text-amber-500'>{!hasAllDetails ? '2' : '1'}</span>
                                                </div>
                                                <p className='text-sm text-amber-900/80 font-medium'>Upload all 4 documents — <span className='font-bold text-amber-900'>ID Front & Back</span> and <span className='font-bold text-amber-900'>License Front & Back</span> in the section below.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI Audit Report Markdown Display */}
                    <AnimatePresence>
                        {showReport && user.verificationReport && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className='overflow-hidden'
                            >
                                <div className='mt-8 pt-8 border-t border-gray-100'>
                                    <h4 className='text-xs font-black text-gray-400 uppercase tracking-widest mb-4'>AI Verification Report & Audit Logs</h4>
                                    <div className='bg-gray-50 rounded-2xl border border-gray-200/50 p-6 md:p-8 overflow-y-auto max-h-[400px]'>
                                        <ReactMarkdown
                                            components={{
                                                h1: ({node, ...props}) => <h1 className="text-lg font-bold text-gray-900 mt-4 mb-2 first:mt-0" {...props} />,
                                                h2: ({node, ...props}) => <h2 className="text-md font-bold text-gray-800 mt-3 mb-1.5" {...props} />,
                                                h3: ({node, ...props}) => <h3 className="text-sm font-bold text-gray-700 mt-2 mb-1" {...props} />,
                                                p: ({node, ...props}) => <p className="text-sm text-gray-600 leading-relaxed mb-2" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-gray-600" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm text-gray-600" {...props} />,
                                                li: ({node, ...props}) => <li className="text-sm text-gray-600" {...props} />,
                                                strong: ({node, ...props}) => <strong className="font-bold text-gray-850" {...props} />,
                                                code: ({node, ...props}) => <code className="bg-gray-200/60 text-rose-600 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                                            }}
                                        >
                                            {user.verificationReport}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Profile Hero Card */}
            <div className='bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden mb-10'>
                <div className='p-10 md:p-14 flex flex-col md:flex-row items-center md:items-start gap-12'>
                    
                    {/* Artistic Profile Image Container */}
                    <div className='relative'>
                        <div className='w-40 h-40 rounded-full p-1 border-2 border-primary/20 bg-white shadow-xl relative overflow-hidden'>
                            <img src={image ? URL.createObjectURL(image) : user.image || assets.user_profile} alt="" className='w-full h-full object-cover rounded-full' />
                        </div>
                        {isEdit && (
                            <label htmlFor='image' className='absolute bottom-1 right-1 p-3 bg-gray-900 text-white rounded-full cursor-pointer shadow-2xl border-4 border-white hover:bg-primary transition-all scale-95 hover:scale-100 z-10'>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden />
                            </label>
                        )}
                    </div>

                    {/* Profile Details Area */}
                    <div className='flex-1 text-center md:text-left flex flex-col justify-center h-40 space-y-4'>
                        <div className='space-y-1'>
                            <h2 className='text-4xl font-black text-gray-900 tracking-tight'>{user.name}</h2>
                            <p className='text-gray-400 font-bold text-xl'>{user.email}</p>
                        </div>
                        
                        <div className='flex flex-wrap justify-center md:justify-start items-center gap-4 pt-2'>
                            <div className='flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest'>
                                <span className='w-1.5 h-1.5 rounded-full bg-primary animate-pulse' />
                                {user.role}
                            </div>
                            <div className='h-4 w-[1px] bg-gray-200 hidden md:block' />
                            <div className='text-[11px] font-black text-primary uppercase tracking-[0.2em]'>
                                Wallet Balance: {user.wallet?.toLocaleString()} EGP
                            </div>
                        </div>
                    </div>
                </div>

                <div className='px-10 md:px-14 pb-14 pt-2'>
                    
                    {/* Information Sections */}
                    <div className='space-y-14'>
                        
                        {/* Information Grid */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8'>
                            <CleanField label="Full Name" value={user.name} name="name" isEdit={isEdit} formData={formData} setFormData={setFormData} />
                            <CleanField label="Email Address" value={user.email} name="email" isEdit={false} formData={formData} setFormData={setFormData} />
                            <CleanField label="Phone Number" value={user.phone} name="phone" isEdit={isEdit} formData={formData} setFormData={setFormData} />
                            <CleanField label="National ID / Passport" value={user.idNumber} name="idNumber" isEdit={isEdit} formData={formData} setFormData={setFormData} />
                            <CleanField label="Driving License" value={user.licenseNumber} name="licenseNumber" isEdit={isEdit} formData={formData} setFormData={setFormData} />
                            <CleanField label="Job Title" value={user.job} name="job" isEdit={isEdit} formData={formData} setFormData={setFormData} />
                            <CleanField label="Nationality" value={user.nationality} name="nationality" isEdit={isEdit} formData={formData} setFormData={setFormData} />
                            <CleanField label="Gender" value={user.gender} name="gender" isEdit={isEdit} formData={formData} setFormData={setFormData} options={['Not Selected', 'Male', 'Female']} />
                            <CleanField label="Date of Birth" value={user.dob} name="dob" isEdit={isEdit} formData={formData} setFormData={setFormData} type="date" />
                            <CleanField label="License Expiry" value={user.licenseExpiry} name="licenseExpiry" isEdit={isEdit} formData={formData} setFormData={setFormData} type="date" />
                            <CleanField label="Emergency Contact" value={user.emergencyContact} name="emergencyContact" isEdit={isEdit} formData={formData} setFormData={setFormData} />
                            <CleanField label="Country" value={user.country} name="country" isEdit={isEdit} formData={formData} setFormData={setFormData} />
                            <div className='grid grid-cols-2 gap-4'>
                                <CleanField label="City" value={user.city} name="city" isEdit={isEdit} formData={formData} setFormData={setFormData} />
                                <CleanField label="Zip Code" value={user.zipCode} name="zipCode" isEdit={isEdit} formData={formData} setFormData={setFormData} />
                            </div>
                            <div className='md:col-span-2'>
                                <CleanField label="Residential Address" value={user.address} name="address" isEdit={isEdit} formData={formData} setFormData={setFormData} type="textarea" />
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className='pt-12 border-t border-gray-100'>
                            <h3 className='text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10'>Verification Assets</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                                <CleanDoc label="ID Front Side" id="idFront" image={idCardFront} setImage={setIdCardFront} current={user.idCardFront} isEdit={isEdit} />
                                <CleanDoc label="ID Back Side" id="idBack" image={idCardBack} setImage={setIdCardBack} current={user.idCardBack} isEdit={isEdit} />
                                <CleanDoc label="License Front Side" id="licenseFront" image={licenseFront} setImage={setLicenseFront} current={user.licenseFront} isEdit={isEdit} />
                                <CleanDoc label="License Back Side" id="licenseBack" image={licenseBack} setImage={setLicenseBack} current={user.licenseBack} isEdit={isEdit} />
                            </div>
                        </div>

                        {/* Footer Action Bar */}
                        <div className='pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-end items-center gap-4'>
                            {isEdit ? (
                                <>
                                    <button onClick={() => setIsEdit(false)} className='text-sm font-semibold text-gray-500 hover:text-gray-800 px-6 py-2 transition-all'>
                                        Cancel
                                    </button>
                                    <button onClick={updateProfileData} className='w-full md:w-auto px-12 py-3.5 bg-primary text-white text-[13px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary/90 shadow-lg transition-all'>
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEdit(true)} className='w-full md:w-auto px-12 py-3.5 bg-gray-900 text-white text-[13px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-black shadow-md transition-all'>
                                    Edit Account
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

const CleanField = ({ label, value, name, isEdit, formData, setFormData, type = "text", options = null }) => (
    <div className='space-y-2'>
        <label className='text-xs font-bold text-gray-400 uppercase tracking-wide ml-1'>{label}</label>
        <div className={`transition-all duration-200 ${isEdit ? 'bg-gray-50 border border-gray-300 rounded-xl' : 'bg-transparent border-transparent'}`}>
            {isEdit ? (
                options ? (
                    <select value={formData[name]} onChange={e => setFormData(p => ({...p, [name]: e.target.value}))} className='w-full px-4 py-3 bg-transparent text-[15px] font-medium text-gray-800 outline-none cursor-pointer'>{options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                ) : type === "textarea" ? (
                    <textarea value={formData[name]} onChange={e => setFormData(p => ({...p, [name]: e.target.value}))} rows={2} className='w-full px-4 py-3 bg-transparent text-[15px] font-medium text-gray-800 outline-none resize-none' />
                ) : (
                    <input type={type} value={formData[name]} onChange={e => setFormData(p => ({...p, [name]: e.target.value}))} className='w-full px-4 py-3 bg-transparent text-[15px] font-medium text-gray-800 outline-none' />
                )
            ) : (
                <div className='px-4 py-1'>
                    <p className='text-[15px] font-semibold text-gray-900 tracking-tight'>{value || <span className='text-gray-300 font-normal italic'>Not provided</span>}</p>
                </div>
            )}
        </div>
    </div>
)

const CleanDoc = ({ label, id, image, setImage, current, isEdit }) => (
    <div className='space-y-4'>
        <label className='text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1'>{label}</label>
        <div className='relative h-64 rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center transition-all group'>
            {image ? (
                <img src={URL.createObjectURL(image)} alt="" className='w-full h-full object-cover' />
            ) : current ? (
                <img src={current} alt="" className='w-full h-full object-cover' />
            ) : (
                <div className='text-center text-gray-300 opacity-50'>
                    <svg className='mx-auto mb-2' width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <p className='text-[9px] font-black uppercase tracking-widest'>Source Required</p>
                </div>
            )}
            {isEdit && (
                <label htmlFor={id} className='absolute inset-0 bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex items-center justify-center backdrop-blur-sm'>
                    <div className='bg-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl'>Update Asset</div>
                    <input onChange={e => setImage(e.target.files[0])} type="file" id={id} hidden />
                </label>
            )}
        </div>
    </div>
)

export default MyAccount
