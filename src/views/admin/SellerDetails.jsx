import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'
import { get_seller, seller_status_update, messageClear } from '../../store/Reducers/sellerReducer'

const SellerDetails = () => {
    const dispatch = useDispatch()
    const { seller, errorMessage } = useSelector(state => state.seller)
    const { sellerId } = useParams()
    const [showShopGallery, setShowShopGallery] = useState(false)
    const [showDocumentGallery, setShowDocumentGallery] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')
    const currentAccountStatus = seller?.accountStatus || (seller?.status === 'deactive' ? 'inactive' : seller?.status) || 'inactive'
    const isActiveSeller = currentAccountStatus === 'active'

    const shopImages = seller?.shopDetails?.shopImages?.length
        ? seller.shopDetails.shopImages
        : (seller?.shopDetails?.shopImage ? [seller.shopDetails.shopImage] : [])

    const documentImages = seller?.identityDetails?.documentImages?.length
        ? seller.identityDetails.documentImages
        : (seller?.identityDetails?.documentImage ? [seller.identityDetails.documentImage] : [])

    useEffect(() => {
        dispatch(get_seller(sellerId))
    }, [sellerId, dispatch])

    const [remark, setRemark] = useState('')

    const handleStatusToggle = async () => {
        if (loadingStatus) {
            return
        }

        if (isActiveSeller && !remark.trim()) {
            toast.error('Remark is required to deactivate account')
            return
        }

        try {
            setLoadingStatus(true)

            const response = await dispatch(seller_status_update({
                sellerId,
                action: isActiveSeller ? 'deactivate' : 'activate',
                remark: remark.trim()
            })).unwrap()

            const newStatus = response.accountStatus || response?.seller?.accountStatus || ''

            if (newStatus === 'active') {
                setStatusMessage('Seller is Activated')
            } else if (newStatus === 'inactive') {
                setStatusMessage('Seller is Deactivated')
            }

            await dispatch(get_seller(sellerId))
            dispatch(messageClear())
        } catch (_) {
            // handled in error effect
        } finally {
            setLoadingStatus(false)
        }
    }

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
    }, [errorMessage, dispatch])

    useEffect(() => {
        if (!statusMessage) {
            return
        }

        toast.success(statusMessage)
        setStatusMessage('')
    }, [statusMessage])

    useEffect(() => {
        if (seller) {
            setRemark(seller.adminRemark || '')
        }
    }, [seller])
    return (
        <div>
            <div className='px-2 lg:px-7 pt-5'>
                <div className='w-full p-4  bg-[#283046] rounded-md'>
                    <div className='w-full flex flex-wrap text-[#d0d2d6]'>
                        <div className='w-full lg:w-6/12 xl:w-3/12 flex justify-center items-center py-3'>
                            <div>
                                {
                                    seller?.image ? <img className='w-full h-[230px]' src={ seller?.image} alt="" /> : <span>Image not uploaded</span>
                                }
                                {seller?.image && (
                                    <div className='pt-3 text-center'>
                                        <a
                                            href={seller.image}
                                            target='_blank'
                                            rel='noreferrer'
                                            className='inline-flex items-center rounded-md bg-blue-500 px-3 py-1 text-sm text-white hover:shadow-lg hover:shadow-blue-500/30'
                                        >
                                            View Profile
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='w-full lg:w-6/12 xl:w-3/12'>
                            <div className='px-0 md:px-5 py-2'>
                                <div className='py-2 text-lg'>
                                    <h2>Basic Info</h2>
                                </div>
                                <div className='flex justify-between text-sm flex-col gap-2 p-4 bg-slate-800 rounded-md'>
                                    <div className='flex gap-2'>
                                        <span>Name : </span>
                                        <span>{seller?.name}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Email : </span>
                                        <span>{seller?.email}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Role : </span>
                                        <span>{seller?.role}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Status : </span>
                                        <span>{seller?.status}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Account Status : </span>
                                        <span>{seller?.accountStatus || (seller?.status === 'deactive' ? 'inactive' : seller?.status)}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Payment Account : </span>
                                        <span>{seller?.payment}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Admin Remark : </span>
                                        <span>{seller?.adminRemark || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='w-full lg:w-6/12 xl:w-3/12'>
                            <div className='px-0 md:px-5 py-2'>
                                <div className='py-2 text-lg'>
                                    <h2>Shop Details</h2>
                                </div>
                                <div className='flex justify-between text-sm flex-col gap-2 p-4 bg-slate-800 rounded-md'>
                                    <div className='flex gap-2'>
                                        <span>Shop Name : </span>
                                        <span>{seller?.shopDetails?.shopName || seller?.shopInfo?.shopName}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Division : </span>
                                        <span>{seller?.shopDetails?.division || seller?.shopInfo?.division}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>District : </span>
                                        <span>{seller?.shopDetails?.district || seller?.shopInfo?.district}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Sub-District : </span>
                                        <span>{seller?.shopDetails?.subDistrict || seller?.shopInfo?.sub_district}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Verification Status : </span>
                                        <span>{seller?.verificationStatus || 'pending_details'}</span>
                                    </div>
                                    <div className='flex items-center justify-between gap-2 pt-2'>
                                        <span>{shopImages.length} image(s)</span>
                                        <button
                                            type='button'
                                            onClick={() => setShowShopGallery((current) => !current)}
                                            disabled={shopImages.length === 0}
                                            className={`rounded-md px-3 py-1 text-white ${shopImages.length ? 'bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30' : 'bg-slate-600 opacity-60 cursor-not-allowed'}`}
                                        >
                                            View Shop Images
                                        </button>
                                    </div>
                                    {showShopGallery && shopImages.length > 0 && (
                                        <div className='grid grid-cols-2 gap-2 pt-2'>
                                            {shopImages.map((image, index) => (
                                                <a
                                                    key={`${image}-${index}`}
                                                    href={image}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    className='block rounded-md overflow-hidden border border-slate-700 hover:border-blue-400'
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`Shop ${index + 1}`}
                                                        className='h-24 w-full object-cover'
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='w-full lg:w-6/12 xl:w-3/12'>
                            <div className='px-0 md:px-5 py-2'>
                                <div className='py-2 text-lg'>
                                    <h2>Identity Details</h2>
                                </div>
                                <div className='flex justify-between text-sm flex-col gap-2 p-4 bg-slate-800 rounded-md'>
                                    <div className='flex gap-2'>
                                        <span>Full Name : </span>
                                        <span>{seller?.identityDetails?.fullName || '-'}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Address : </span>
                                        <span>{seller?.identityDetails?.address || '-'}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Document Type : </span>
                                        <span>{seller?.identityDetails?.documentType || '-'}</span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <span>Document Number : </span>
                                        <span>{seller?.identityDetails?.documentNumber || '-'}</span>
                                    </div>
                                    <div className='flex items-center justify-between gap-2 pt-2'>
                                        <span>{documentImages.length} image(s)</span>
                                        <button
                                            type='button'
                                            onClick={() => setShowDocumentGallery((current) => !current)}
                                            disabled={documentImages.length === 0}
                                            className={`rounded-md px-3 py-1 text-white ${documentImages.length ? 'bg-green-500 hover:shadow-lg hover:shadow-green-500/30' : 'bg-slate-600 opacity-60 cursor-not-allowed'}`}
                                        >
                                            View Documents
                                        </button>
                                    </div>
                                    {showDocumentGallery && documentImages.length > 0 && (
                                        <div className='grid grid-cols-2 gap-2 pt-2'>
                                            {documentImages.map((image, index) => (
                                                <a
                                                    key={`${image}-${index}`}
                                                    href={image}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    className='block rounded-md overflow-hidden border border-slate-700 hover:border-green-400'
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`Document ${index + 1}`}
                                                        className='h-24 w-full object-cover'
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='mt-4 rounded-md bg-slate-800 p-4 text-[#d0d2d6]'>
                        <h3 className='text-lg font-medium mb-3'>Admin Action</h3>
                        <div className='flex flex-col gap-2'>
                            <label htmlFor='adminRemark'>Remark</label>
                            <textarea
                                id='adminRemark'
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                disabled={!isActiveSeller || loadingStatus}
                                className='min-h-[110px] px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6] disabled:cursor-not-allowed disabled:opacity-70'
                                placeholder={isActiveSeller ? 'Add reason when deactivating this seller' : 'Remark will clear automatically on activation'}
                            />
                        </div>
                        <div className='flex flex-col sm:flex-row gap-3 py-4'>
                            {loadingStatus ? (
                                <div
                                    className='h-10 w-[140px] rounded-md bg-[linear-gradient(90deg,#475569_25%,#64748b_50%,#475569_75%)] bg-[length:200%_100%] animate-pulse'
                                    aria-label='Updating seller status'
                                />
                            ) : (
                                <button
                                    type='button'
                                    onClick={handleStatusToggle}
                                    disabled={loadingStatus}
                                    className={`${isActiveSeller ? 'bg-red-500 hover:shadow-red-500/50' : 'bg-blue-500 hover:shadow-blue-500/50'} hover:shadow-lg text-white rounded-md px-7 py-2 disabled:cursor-not-allowed disabled:opacity-70`}
                                >
                                    {isActiveSeller ? 'Deactivate' : 'Activate'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SellerDetails
