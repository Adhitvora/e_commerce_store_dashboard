import React from 'react'
import { Suspense } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const getEffectiveVerificationStatus = (userInfo, verificationStatus) => {
    return verificationStatus || userInfo?.verificationStatus || 'pending_details'
}

const getEffectiveAccountStatus = (userInfo, accountStatus, restricted) => {
    if (accountStatus) {
        return accountStatus
    }

    if (restricted || userInfo?.isRestricted || userInfo?.status === 'deactive' || userInfo?.verificationStatus === 'rejected') {
        return 'inactive'
    }

    return userInfo?.status || ''
}

const ProtectRoute = ({ route, children }) => {
    const { role, userInfo, verificationStatus, accountStatus, restricted } = useSelector(state => state.auth)
    if (role) {
        if (!userInfo) {
            return null
        }

        if (userInfo) {
            if (route.role) {
                if (userInfo.role === route.role) {
                    if (userInfo.role === 'seller') {
                        const sellerVerificationStatus = getEffectiveVerificationStatus(userInfo, verificationStatus)
                        const sellerAccountStatus = getEffectiveAccountStatus(userInfo, accountStatus, restricted)
                        const inactiveRouteAccessAllowed = sellerAccountStatus === 'inactive' && route.allowInactive

                        if (sellerAccountStatus === 'inactive' && !route.allowInactive) {
                            return <Navigate to='/seller/verification' replace />
                        }

                        if (!inactiveRouteAccessAllowed && route.onlyWhenVerificationIncomplete && sellerVerificationStatus === 'approved') {
                            return <Navigate to='/seller/dashboard' replace />
                        }

                        if (!inactiveRouteAccessAllowed && sellerVerificationStatus === 'pending_details' && !route.allowPendingDetails) {
                            return <Navigate to='/seller/verification' replace />
                        }

                        if (!inactiveRouteAccessAllowed && sellerVerificationStatus === 'pending_admin' && !route.allowPendingApproval) {
                            return <Navigate to='/seller/account-pending' replace />
                        }
                    }

                    if (route.status) {
                        if (route.status === userInfo.status) {
                            return <Suspense fallback={null}>{children}</Suspense>
                        } else {
                            if (userInfo.status === 'pending') {
                                return <Navigate to='/seller/account-pending' replace />
                            } else {
                                return <Navigate to='/seller/account-deactive' replace />
                            }
                        }
                    } else {
                        if (route.visibility) {
                            if (route.visibility.some(r => r === userInfo.status)) {
                                return <Suspense fallback={null}>{children}</Suspense>
                            } else {
                                return <Navigate to='/seller/account-pending' replace />
                            }
                        } else {
                            return <Suspense fallback={null}>{children}</Suspense>
                        }
                    }
                    //return <Suspense fallback={null}>{children}</Suspense>
                } else {
                    return <Navigate to='/unauthorized' replace />
                }
            }
        }
    } else {
        return <Navigate to='/login' replace />
    }
}

export default ProtectRoute
