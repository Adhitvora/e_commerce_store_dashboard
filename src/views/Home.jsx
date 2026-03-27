import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
const Home = () => {
    const { role, accountStatus, restricted, userInfo } = useSelector(state => state.auth)
    const sellerInactive =
        role === 'seller' && (
            accountStatus === 'inactive' ||
            restricted ||
            userInfo?.status === 'deactive' ||
            userInfo?.verificationStatus === 'rejected'
        )

    if (role === 'seller') return <Navigate to={sellerInactive ? '/seller/verification' : '/seller/dashboard'} replace />
    else if (role === 'admin') return <Navigate to='/admin/dashboard' replace />
    else return <Navigate to='/login' replace />
}

export default Home
