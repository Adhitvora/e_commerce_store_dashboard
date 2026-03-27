import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PropagateLoader } from 'react-spinners'
import { complete_seller_verification, messageClear } from '../../store/Reducers/authReducer'
import { overrideStyle } from '../../utils/utils'
import MultiImageUploadField from '../components/MultiImageUploadField'

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
const AADHAAR_REGEX = /^[0-9]{4}-[0-9]{4}-[0-9]{4}$/
const MAX_FILE_SIZE = 2 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILES_PER_FIELD = 5

const formatAadhaar = (value = '') => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 12)
    return digitsOnly.match(/.{1,4}/g)?.join('-') || ''
}

const createPreviewItem = (file, index) => ({
    id: `${file.name}-${file.size}-${index}-${Date.now()}`,
    name: file.name,
    url: URL.createObjectURL(file)
})

const SellerVerification = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { userInfo, loader, errorMessage } = useSelector(state => state.auth)

    const [formState, setFormState] = useState({
        shopName: '',
        division: '',
        district: '',
        subDistrict: '',
        fullName: '',
        address: '',
        documentType: 'aadhaar',
        documentNumber: ''
    })
    const [selectedFiles, setSelectedFiles] = useState({
        image: null,
        shopImages: [],
        documentImages: []
    })
    const [previews, setPreviews] = useState({
        image: '',
        shopImages: [],
        documentImages: []
    })
    const [errors, setErrors] = useState({})
    const previewRef = useRef(previews)
    const [profileImageRemoved, setProfileImageRemoved] = useState(false)

    const existingShopImages = useMemo(() => {
        return userInfo?.shopDetails?.shopImages || []
    }, [userInfo])

    const existingDocumentImages = useMemo(() => {
        return userInfo?.identityDetails?.documentImages || []
    }, [userInfo])

    const existingProfileImage = useMemo(() => {
        return userInfo?.image || userInfo?.profileImage || ''
    }, [userInfo])

    useEffect(() => {
        if (!userInfo) {
            return
        }

        setFormState({
            shopName: userInfo?.shopDetails?.shopName || userInfo?.shopInfo?.shopName || '',
            division: userInfo?.shopDetails?.division || userInfo?.shopInfo?.division || '',
            district: userInfo?.shopDetails?.district || userInfo?.shopInfo?.district || '',
            subDistrict: userInfo?.shopDetails?.subDistrict || userInfo?.shopInfo?.sub_district || '',
            fullName: userInfo?.identityDetails?.fullName || '',
            address: userInfo?.identityDetails?.address || '',
            documentType: userInfo?.identityDetails?.documentType || 'aadhaar',
            documentNumber: userInfo?.identityDetails?.documentType === 'aadhaar'
                ? formatAadhaar(userInfo?.identityDetails?.documentNumber || '')
                : (userInfo?.identityDetails?.documentNumber || '')
        })

        setPreviews((current) => ({
            ...current,
            image: userInfo?.image || userInfo?.profileImage || ''
        }))
        setProfileImageRemoved(false)
    }, [userInfo])

    useEffect(() => {
        previewRef.current = previews
    }, [previews])

    useEffect(() => {
        return () => {
            if (previewRef.current.image?.startsWith('blob:')) {
                URL.revokeObjectURL(previewRef.current.image)
            }
            previewRef.current.shopImages.forEach((item) => URL.revokeObjectURL(item.url))
            previewRef.current.documentImages.forEach((item) => URL.revokeObjectURL(item.url))
        }
    }, [])

    useEffect(() => {
        if (errorMessage) {
            setErrors((current) => ({
                ...current,
                form: errorMessage
            }))
            dispatch(messageClear())
        }
    }, [errorMessage, dispatch])

    const inputHandle = (e) => {
        const { name, value } = e.target

        let nextValue = value

        if (name === 'documentNumber') {
            if (formState.documentType === 'aadhaar') {
                nextValue = formatAadhaar(value)
            } else {
                nextValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
            }
        }

        if (name === 'documentType') {
            nextValue = value
        }

        setFormState((current) => ({
            ...current,
            [name]: nextValue,
            ...(name === 'documentType'
                ? {
                    documentNumber: value === 'aadhaar'
                        ? formatAadhaar(current.documentNumber)
                        : current.documentNumber.replace(/[^A-Z0-9]/g, '').toUpperCase().slice(0, 10)
                }
                : {})
        }))

        setErrors((current) => ({
            ...current,
            [name]: '',
            documentNumber: '',
            form: ''
        }))
    }

    const validateSelectedFiles = (incomingFiles = [], currentFiles = []) => {
        if (currentFiles.length + incomingFiles.length > MAX_FILES_PER_FIELD) {
            return `You can upload up to ${MAX_FILES_PER_FIELD} images`
        }

        for (const file of incomingFiles) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                return 'Only JPG, PNG, WEBP allowed'
            }

            if (file.size > MAX_FILE_SIZE) {
                return 'File size must be under 2MB'
            }
        }

        return ''
    }

    const validateSingleImage = (file) => {
        if (!file) {
            return 'Profile image is required'
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Only JPG, PNG, WEBP allowed'
        }

        if (file.size > MAX_FILE_SIZE) {
            return 'File size must be under 2MB'
        }

        return ''
    }

    const fileHandle = (e) => {
        const { name, files } = e.target
        const incomingFiles = Array.from(files || [])

        if (incomingFiles.length === 0) {
            return
        }

        if (name === 'image') {
            const selectedImage = incomingFiles[0]
            const validationError = validateSingleImage(selectedImage)

            if (validationError) {
                setErrors((current) => ({
                    ...current,
                    image: validationError,
                    form: ''
                }))
                e.target.value = ''
                return
            }

            if (previews.image?.startsWith('blob:')) {
                URL.revokeObjectURL(previews.image)
            }

            setSelectedFiles((current) => ({
                ...current,
                image: selectedImage
            }))

            setPreviews((current) => ({
                ...current,
                image: URL.createObjectURL(selectedImage)
            }))
            setProfileImageRemoved(false)

            setErrors((current) => ({
                ...current,
                image: '',
                form: ''
            }))

            e.target.value = ''
            return
        }

        const currentFiles = selectedFiles[name] || []
        const validationError = validateSelectedFiles(incomingFiles, currentFiles)

        if (validationError) {
            setErrors((current) => ({
                ...current,
                [name]: validationError,
                form: ''
            }))
            e.target.value = ''
            return
        }

        const previewItems = incomingFiles.map(createPreviewItem)

        setSelectedFiles((current) => ({
            ...current,
            [name]: [...current[name], ...incomingFiles]
        }))

        setPreviews((current) => ({
            ...current,
            [name]: [...current[name], ...previewItems]
        }))

        setErrors((current) => ({
            ...current,
            [name]: '',
            form: ''
        }))

        e.target.value = ''
    }

    const removeFile = (fieldName, previewId) => {
        const previewIndex = previews[fieldName].findIndex((item) => item.id === previewId)

        if (previewIndex === -1) {
            return
        }

        URL.revokeObjectURL(previews[fieldName][previewIndex].url)

        setPreviews((current) => ({
            ...current,
            [fieldName]: current[fieldName].filter((item) => item.id !== previewId)
        }))

        setSelectedFiles((current) => ({
            ...current,
            [fieldName]: current[fieldName].filter((_, index) => index !== previewIndex)
        }))

        setErrors((current) => ({
            ...current,
            [fieldName]: '',
            form: ''
        }))
    }

    const removeProfileImage = () => {
        if (previews.image?.startsWith('blob:')) {
            URL.revokeObjectURL(previews.image)
        }

        setSelectedFiles((current) => ({
            ...current,
            image: null
        }))

        setPreviews((current) => ({
            ...current,
            image: existingProfileImage && !selectedFiles.image ? '' : existingProfileImage
        }))
        setProfileImageRemoved(!selectedFiles.image)

        setErrors((current) => ({
            ...current,
            image: existingProfileImage && selectedFiles.image ? '' : 'Profile image is required',
            form: ''
        }))
    }

    const validate = () => {
        const nextErrors = {}
        const trimmedDocumentNumber = formState.documentNumber.trim()

        if (!formState.shopName.trim()) nextErrors.shopName = 'Shop name is required'
        if (!formState.division.trim()) nextErrors.division = 'Division is required'
        if (!formState.district.trim()) nextErrors.district = 'District is required'
        if (!formState.subDistrict.trim()) nextErrors.subDistrict = 'Sub district is required'
        if (!formState.fullName.trim()) nextErrors.fullName = 'Full name is required'
        if (!formState.address.trim()) nextErrors.address = 'Address is required'
        if (!selectedFiles.image && !previews.image && (!existingProfileImage || profileImageRemoved)) nextErrors.image = 'Profile image is required'
        if (selectedFiles.shopImages.length === 0) nextErrors.shopImages = 'At least one shop image is required'
        if (selectedFiles.documentImages.length === 0) nextErrors.documentImages = 'At least one document image is required'

        if (!trimmedDocumentNumber) {
            nextErrors.documentNumber = 'Document number is required'
        } else if (formState.documentType === 'aadhaar' && !AADHAAR_REGEX.test(trimmedDocumentNumber)) {
            nextErrors.documentNumber = 'Invalid Aadhaar format (xxxx-xxxx-xxxx)'
        } else if (formState.documentType === 'pan' && !PAN_REGEX.test(trimmedDocumentNumber.toUpperCase())) {
            nextErrors.documentNumber = 'Invalid PAN format'
        }

        return nextErrors
    }

    const submit = async (e) => {
        e.preventDefault()

        const nextErrors = validate()

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors)
            return
        }

        const submission = new FormData()
        submission.append('shopName', formState.shopName.trim())
        submission.append('division', formState.division.trim())
        submission.append('district', formState.district.trim())
        submission.append('subDistrict', formState.subDistrict.trim())
        submission.append('fullName', formState.fullName.trim())
        submission.append('address', formState.address.trim())
        submission.append('documentType', formState.documentType)
        submission.append('documentNumber', formState.documentType === 'pan'
            ? formState.documentNumber.trim().toUpperCase()
            : formState.documentNumber.trim())

        if (selectedFiles.image) {
            submission.append('image', selectedFiles.image)
        }

        selectedFiles.shopImages.forEach((file) => {
            submission.append('shopImages', file)
        })

        selectedFiles.documentImages.forEach((file) => {
            submission.append('documentImages', file)
        })

        try {
            await dispatch(complete_seller_verification(submission)).unwrap()
            toast.success('Submitted for admin approval')
            dispatch(messageClear())
            navigate('/seller/account-pending')
        } catch (error) {
            setErrors((current) => ({
                ...current,
                form: error?.error || error?.message || 'Verification submission failed'
            }))
        }
    }

    return (
        <div className='px-2 lg:px-7 py-5'>
            <div className='w-full max-w-6xl mx-auto bg-[#283046] rounded-md text-[#d0d2d6] p-4 sm:p-5'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-semibold'>Seller Verification</h1>
                    <p className='text-sm text-slate-300 mt-1'>
                        Add your shop details, identity details, and image proofs to move your account into admin review.
                    </p>
                    <p className='text-xs text-slate-400 mt-2'>
                        Accepted files: JPG, PNG, WEBP. Maximum size: 2MB each. Up to 5 images per section.
                    </p>
                </div>

                <form onSubmit={submit}>
                    <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                        <div className='bg-slate-800 rounded-md p-4'>
                            <h2 className='text-lg font-medium mb-4'>Shop Details</h2>

                            <div className='mb-4 rounded-md border border-slate-700 bg-[#283046] p-3'>
                                <label htmlFor='image' className='block mb-2'>Profile Image</label>
                                <input
                                    id='image'
                                    name='image'
                                    type='file'
                                    accept='image/jpeg,image/png,image/webp'
                                    onChange={fileHandle}
                                    className='w-full px-4 py-2 focus:border-indigo-500 outline-none bg-[#161d31] border border-slate-700 rounded-md text-[#d0d2d6]'
                                />
                                <p className='mt-2 text-xs text-slate-400'>Required. Maximum 2MB. JPG, PNG, WEBP only.</p>
                                {errors.image && <span className='mt-2 block text-sm text-red-400'>{errors.image}</span>}
                                {previews.image && (
                                    <div className='mt-3 max-w-[220px] rounded-md border border-slate-700 overflow-hidden bg-[#161d31]'>
                                        <img
                                            src={previews.image}
                                            alt='Profile preview'
                                            className='h-36 w-full object-cover'
                                        />
                                        <div className='p-2'>
                                            <button
                                                type='button'
                                                onClick={removeProfileImage}
                                                className='text-xs text-red-400 hover:text-red-300'
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className='flex flex-col gap-1 mb-3'>
                                <label htmlFor='shopName'>Shop Name</label>
                                <input
                                    id='shopName'
                                    name='shopName'
                                    value={formState.shopName}
                                    onChange={inputHandle}
                                    className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                    placeholder='Shop name'
                                />
                                {errors.shopName && <span className='text-sm text-red-400'>{errors.shopName}</span>}
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                <div className='flex flex-col gap-1 mb-3'>
                                    <label htmlFor='division'>Division</label>
                                    <input
                                        id='division'
                                        name='division'
                                        value={formState.division}
                                        onChange={inputHandle}
                                        className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                        placeholder='Division'
                                    />
                                    {errors.division && <span className='text-sm text-red-400'>{errors.division}</span>}
                                </div>

                                <div className='flex flex-col gap-1 mb-3'>
                                    <label htmlFor='district'>District</label>
                                    <input
                                        id='district'
                                        name='district'
                                        value={formState.district}
                                        onChange={inputHandle}
                                        className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                        placeholder='District'
                                    />
                                    {errors.district && <span className='text-sm text-red-400'>{errors.district}</span>}
                                </div>
                            </div>

                            <div className='flex flex-col gap-1 mb-4'>
                                <label htmlFor='subDistrict'>Sub District</label>
                                <input
                                    id='subDistrict'
                                    name='subDistrict'
                                    value={formState.subDistrict}
                                    onChange={inputHandle}
                                    className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                    placeholder='Sub district'
                                />
                                {errors.subDistrict && <span className='text-sm text-red-400'>{errors.subDistrict}</span>}
                            </div>

                            <MultiImageUploadField
                                id='shopImages'
                                name='shopImages'
                                label='Shop Images'
                                previews={previews.shopImages}
                                error={errors.shopImages}
                                helperText={existingShopImages.length > 0 ? `Existing uploads: ${existingShopImages.length}` : 'Upload clear shop photos for admin review.'}
                                onChange={fileHandle}
                                onRemove={(previewId) => removeFile('shopImages', previewId)}
                            />
                        </div>

                        <div className='bg-slate-800 rounded-md p-4'>
                            <h2 className='text-lg font-medium mb-4'>Personal Details</h2>

                            <div className='flex flex-col gap-1 mb-3'>
                                <label htmlFor='fullName'>Full Name</label>
                                <input
                                    id='fullName'
                                    name='fullName'
                                    value={formState.fullName}
                                    onChange={inputHandle}
                                    className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                    placeholder='Full name as per document'
                                />
                                {errors.fullName && <span className='text-sm text-red-400'>{errors.fullName}</span>}
                            </div>

                            <div className='flex flex-col gap-1 mb-3'>
                                <label htmlFor='address'>Address</label>
                                <textarea
                                    id='address'
                                    name='address'
                                    value={formState.address}
                                    onChange={inputHandle}
                                    className='px-4 py-2 min-h-[110px] focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                    placeholder='Address'
                                />
                                {errors.address && <span className='text-sm text-red-400'>{errors.address}</span>}
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                <div className='flex flex-col gap-1 mb-3'>
                                    <label htmlFor='documentType'>Document Type</label>
                                    <select
                                        id='documentType'
                                        name='documentType'
                                        value={formState.documentType}
                                        onChange={inputHandle}
                                        className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                    >
                                        <option value='aadhaar'>Aadhaar</option>
                                        <option value='pan'>PAN</option>
                                    </select>
                                </div>

                                <div className='flex flex-col gap-1 mb-3'>
                                    <label htmlFor='documentNumber'>Document Number</label>
                                    <input
                                        id='documentNumber'
                                        name='documentNumber'
                                        value={formState.documentNumber}
                                        onChange={inputHandle}
                                        maxLength={formState.documentType === 'aadhaar' ? 14 : 10}
                                        className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
                                        placeholder={formState.documentType === 'aadhaar' ? '1234-1234-1234' : 'ABCDE1234F'}
                                    />
                                    {errors.documentNumber && <span className='text-sm text-red-400'>{errors.documentNumber}</span>}
                                </div>
                            </div>

                            <MultiImageUploadField
                                id='documentImages'
                                name='documentImages'
                                label='Document Images'
                                previews={previews.documentImages}
                                error={errors.documentImages}
                                helperText={existingDocumentImages.length > 0 ? `Existing uploads: ${existingDocumentImages.length}` : 'Upload the front and supporting document images if needed.'}
                                onChange={fileHandle}
                                onRemove={(previewId) => removeFile('documentImages', previewId)}
                            />
                        </div>
                    </div>

                    {errors.form && (
                        <div className='mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300'>
                            {errors.form}
                        </div>
                    )}

                    <div className='mt-6 flex justify-end'>
                        <button
                            disabled={loader}
                            className='bg-blue-500 min-w-[220px] hover:shadow-blue-500/20 hover:shadow-lg text-white rounded-md px-7 py-2 disabled:cursor-not-allowed disabled:opacity-70'
                        >
                            {loader ? (
                                <PropagateLoader color='#fff' cssOverride={overrideStyle} />
                            ) : (
                                'Submit Verification'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SellerVerification
