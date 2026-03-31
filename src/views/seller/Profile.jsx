import React, { useEffect, useState } from 'react'
import { BsImages } from 'react-icons/bs'
import { FaEdit } from 'react-icons/fa'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { PropagateLoader } from 'react-spinners'
import { FadeLoader } from 'react-spinners'
import toast from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { overrideStyle } from '../../utils/utils'
import { profile_image_upload, messageClear, profile_info_add, resetAuthState, seller_change_password } from '../../store/Reducers/authReducer'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

const Profile = () => {
    const [state, setState] = useState({
        division: '',
        district: '',
        shopName: '',
        sub_district: ''
    })
    const [passwordState, setPasswordState] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { userInfo, loader, passwordLoader, successMessage, errorMessage } = useSelector(state => state.auth)
    const [shouldRedirect, setShouldRedirect] = useState(false)
    const [authAction, setAuthAction] = useState('')

    const add_image = (e) => {
        if (e.target.files.length > 0) {
            const formData = new FormData()
            formData.append('image', e.target.files[0])
            dispatch(profile_image_upload(formData))
        }
    }
    useEffect(() => {
        let redirectTimer

        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
            setShouldRedirect(false)
            setAuthAction('')
        }

        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
            if (authAction === 'password') {
                dispatch(resetAuthState())
                navigate('/login')
            } else if (shouldRedirect) {
                redirectTimer = setTimeout(() => {
                    navigate('/seller/dashboard')
                }, 800)
            }
            setPasswordState({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
            setShowOldPassword(false)
            setShowNewPassword(false)
            setShowConfirmPassword(false)
            setAuthAction('')
        }

        return () => {
            if (redirectTimer) clearTimeout(redirectTimer)
        }
    }, [successMessage, errorMessage, shouldRedirect, authAction, dispatch, navigate])


    const add = (e) => {
        e.preventDefault()
        setShouldRedirect(true)
        setAuthAction('profile')
        dispatch(profile_info_add(state))
    }

    const passwordInputHandle = (e) => {
        setPasswordState({
            ...passwordState,
            [e.target.name]: e.target.value
        })
    }

    const changePasswordSubmit = (e) => {
        e.preventDefault()

        if (!passwordRegex.test(passwordState.newPassword)) {
            toast.error('Password must be at least 8 characters and include uppercase, lowercase, number and special character')
            return
        }

        if (passwordState.newPassword !== passwordState.confirmPassword) {
            toast.error('New password and confirm password do not match')
            return
        }

        setAuthAction('password')
        dispatch(seller_change_password(passwordState))
    }

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }
    return (
        <div className='px-2 lg:px-7 py-5'>
            <div className='w-full flex flex-wrap'>
                <div className='w-full md:w-6/12'>
                    <div className='w-full p-4  bg-[#283046] rounded-md text-[#d0d2d6]'>
                        <div className='flex justify-center items-center py-3'>
                            {
                                userInfo?.image ? <label htmlFor="img" className='h-[210px] w-[300px] relative p-3 cursor-pointer overflow-hidden'>
                                    <img className='w-full h-full' src={userInfo.image} alt="" />
                                    {
                                        loader && <div className='bg-slate-600 absolute left-0 top-0 w-full h-full opacity-70 flex justify-center items-center z-20'>
                                            <span>
                                                <FadeLoader />
                                            </span>
                                        </div>
                                    }
                                </label> : <label className='flex justify-center items-center flex-col h-[210px] w-[300px] cursor-pointer border border-dashed hover:border-indigo-500 border-[#d0d2d6] relative' htmlFor="img">
                                    <span><BsImages /></span>
                                    <span>Select Image</span>
                                    {
                                        loader && <div className='bg-slate-600 absolute left-0 top-0 w-full h-full opacity-70 flex justify-center items-center z-20'>
                                            <span>
                                                <FadeLoader />
                                            </span>
                                        </div>
                                    }
                                </label>
                            }
                            <input onChange={add_image} type="file" className='hidden' id='img' />
                        </div>
                        <div className='px-0 md:px-5 py-2'>
                            <div className='flex justify-between text-sm flex-col gap-2 p-4 bg-slate-800 rounded-md relative'>
                                <span className='p-[6px] bg-yellow-500 rounded hover:shadow-lg hover:shadow-yellow-500/50 absolute right-2 top-2 cursor-pointer'><FaEdit /></span>
                                <div className='flex gap-2'>
                                    <span>Name : </span>
                                    <span>{userInfo.name}</span>
                                </div>
                                <div className='flex gap-2'>
                                    <span>Email : </span>
                                    <span>{userInfo.email}</span>
                                </div>
                                <div className='flex gap-2'>
                                    <span>Role : </span>
                                    <span>{userInfo.role}</span>
                                </div>
                                <div className='flex gap-2'>
                                    <span>Status : </span>
                                    <span>{userInfo.status}</span>
                                </div>
                                {/* <div className='flex gap-2'>
                                    <span>Payment Account : </span>
                                    <p>
                                        {
                                            userInfo.payment === 'active' ? <span className='bg-red-500 text-white text-xs cursor-pointer font-normal ml-2 px-2 py-0.5 rounded '>{userInfo.payment}</span> : <span onClick={() => dispatch(create_razorpay_account())} className='bg-blue-500 text-white text-xs cursor-pointer font-normal ml-2 px-2 py-0.5 rounded '>
                                                click active
                                            </span>
                                        }
                                    </p>
                                </div> */}
                            </div>
                        </div>
                        <div className='px-0 md:px-5 py-2'>
                            {
                                !userInfo?.shopInfo ? <form onSubmit={add}>
                                    <div className='flex flex-col w-full gap-1 mb-3'>
                                        <label htmlFor="Shop">Shop Name</label>
                                        <input value={state.shopName} onChange={inputHandle} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]' type="text" placeholder='shop name' name='shopName' id='Shop' required />
                                    </div>
                                    <div className='flex flex-col w-full gap-1' >
                                        <label htmlFor="div">Division</label>
                                        <input value={state.division} required onChange={inputHandle} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]' type="text" placeholder='division' name='division' id='div' />
                                    </div>
                                    <div className='flex flex-col w-full gap-1 mb-3'>
                                        <label htmlFor="district">District</label>
                                        <input value={state.district} required onChange={inputHandle} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]' type="text" placeholder='district' name='district' id='district' />
                                    </div>
                                    <div className='flex flex-col w-full gap-1 mb-3'>
                                        <label htmlFor="sub">Sub District</label>
                                        <input required value={state.sub_district} onChange={inputHandle} className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]' type="text" placeholder='sub district' name='sub_district' id='sub' />
                                    </div>
                                    <button disabled={loader ? true : false} className='bg-blue-500 w-[190px] hover:shadow-blue-500/20 hover:shadow-lg text-white rounded-md px-7 py-2 mb-3'>
                                        {
                                            loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Update Info'
                                        }
                                    </button>
                                </form> : <div className='flex justify-between text-sm flex-col gap-2 p-4 bg-slate-800 rounded-md relative'>
                                    <span className='p-[6px] bg-yellow-500 rounded hover:shadow-lg hover:shadow-yellow-500/50 absolute right-2 top-2 cursor-pointer'><FaEdit /></span>
                                    <div className='flex gap-2'>
                                        <span>Shop Name : </span>
                                        <span>{userInfo.shopInfo?.shopName}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Division : </span>
                                        <span>{userInfo.shopInfo?.division}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>District : </span>
                                        <span>{userInfo.shopInfo?.district}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Sub District : </span>
                                        <span>{userInfo.shopInfo?.sub_district}</span>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className='w-full md:w-6/12'>
                    <div className='w-full pl-0 md:pl-7 mt-6 md:mt-0  '>
                        <div className='bg-[#283046] rounded-md text-[#d0d2d6] p-4'>
                            <h1 className='text-[#d0d2d6] text-lg mb-3 font-semibold'>Change Password</h1>
                            <form onSubmit={changePasswordSubmit}>
                                <div className='flex flex-col w-full gap-1'>
                                    <label htmlFor="o_password">Old Password</label>
                                    <div className='relative'>
                                        <input
                                            className='w-full px-4 py-2 pr-10 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                            type={showOldPassword ? 'text' : 'password'}
                                            autoComplete='current-password'
                                            placeholder='old password'
                                            value={passwordState.currentPassword}
                                            onChange={passwordInputHandle}
                                            name='currentPassword'
                                            id='o_password'
                                            required
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowOldPassword((prev) => !prev)}
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200'
                                            aria-label={showOldPassword ? 'Hide old password' : 'Show old password'}
                                        >
                                            {showOldPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className='flex flex-col w-full gap-1'>
                                    <label htmlFor="n_password">New Password</label>
                                    <div className='relative'>
                                        <input
                                            className='w-full px-4 py-2 pr-10 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                            type={showNewPassword ? 'text' : 'password'}
                                            autoComplete='new-password'
                                            placeholder='new password'
                                            value={passwordState.newPassword}
                                            onChange={passwordInputHandle}
                                            name='newPassword'
                                            id='n_password'
                                            required
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowNewPassword((prev) => !prev)}
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200'
                                            aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                                        >
                                            {showNewPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                </div>
                                <p className='text-xs text-slate-400 mt-2'>Use at least 8 characters with uppercase, lowercase, number and special character.</p>
                                <div className='flex flex-col w-full gap-1 mt-4'>
                                    <label htmlFor="c_password">Confirm New Password</label>
                                    <div className='relative'>
                                        <input
                                            className='w-full px-4 py-2 pr-10 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            autoComplete='new-password'
                                            placeholder='confirm new password'
                                            value={passwordState.confirmPassword}
                                            onChange={passwordInputHandle}
                                            name='confirmPassword'
                                            id='c_password'
                                            required
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200'
                                            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                        >
                                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                </div>
                                <button disabled={passwordLoader} className='bg-blue-500 hover:shadow-blue-500/50 hover:shadow-lg text-white rounded-md px-7 py-2 mt-5 min-w-[180px]'>
                                    {
                                        passwordLoader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Update Password'
                                    }
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
