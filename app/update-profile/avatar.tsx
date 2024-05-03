'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

export default function Avatar({
    uid,
    url,
    size,
    onUpload,
}: {
    uid: string | null
    url: string | null
    size: number
    onUpload: (url: string) => void
}) {
    const supabase = createClient()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        async function downloadImage(path: string) {
            try {
                const { data, error } = await supabase.storage.from('profile_picture').download(path)
                if (error) {
                    throw error
                }

                const url = URL.createObjectURL(data)
                setAvatarUrl(url)
            } catch (error) {
                console.log('Error downloading image: ', error)
            }
        }

        if (url) downloadImage(url)
    }, [url, supabase])

    const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const filePath = `${uid}-${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage.from('profile_picture').upload(filePath, file)

            if (uploadError) {

                throw uploadError
            }

            onUpload(filePath)
        } catch (error) {
            alert('Error uploading avatar!')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div style={{ position: 'relative', display: 'inline-block', textAlign: 'center' }}>
            <Image
                width={size}
                height={size}
                src={avatarUrl ? avatarUrl : '/user-profile-icon.jpg'}
                alt="Avatar"
                className="avatar image"
                style={{
                    height: size,
                    width: size,
                    borderRadius: '50%', // Makes the avatar circular
                    objectFit: 'cover', // Ensures the image covers the area without stretching
                    backgroundColor: '#f0f0f0', // Background color for the avatar
                    padding: '2px', // Adds some padding around the avatar
                    border: '1px solid #ccc', // Adds a border around the avatar
                    display: 'inline-block', // Ensure the image is displayed inline
                    verticalAlign: 'middle',
                }}
            />
            <label
                htmlFor="avatar-upload"
                style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    cursor: 'pointer',
                    display: 'inline-block' // Ensure the label is displayed inline
                }}
            >
                <input id="avatar-upload" type="file" style={{ display: 'none' }} onChange={uploadAvatar} disabled={uploading} />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="#007bff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M14 2L4 12h.01l6.99 7.01L21 9l-1.99-2L8 17 6 22l5-2 5-5 5-5-7-7z" />
                </svg>
            </label>
        </div>
    )
}