import React from 'react'

const MultiImageUploadField = ({
    id,
    name,
    label,
    previews,
    error,
    helperText,
    onChange,
    onRemove
}) => {
    return (
        <div className='flex flex-col gap-2'>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                name={name}
                type='file'
                accept='image/jpeg,image/png,image/webp'
                multiple
                onChange={onChange}
                className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]'
            />
            {helperText && <span className='text-xs text-slate-400'>{helperText}</span>}
            {error && <span className='text-sm text-red-400'>{error}</span>}

            {previews.length > 0 && (
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                    {previews.map((item) => (
                        <div
                            key={item.id}
                            className='rounded-md border border-slate-700 overflow-hidden bg-[#283046]'
                        >
                            <img
                                src={item.url}
                                alt={item.name}
                                className='h-28 w-full object-cover'
                            />
                            <div className='p-2'>
                                <p className='text-xs text-slate-300 truncate'>{item.name}</p>
                                <button
                                    type='button'
                                    onClick={() => onRemove(item.id)}
                                    className='mt-2 text-xs text-red-400 hover:text-red-300'
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MultiImageUploadField
