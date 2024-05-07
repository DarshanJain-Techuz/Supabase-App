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
        <div className="flex justify-center items-center relative mb-3">
            <div className="relative">
                <Image
                    width={size}
                    height={size}
                    src={avatarUrl ? avatarUrl : '/user-profile-1.png'}
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
                        verticalAlign: 'middle',
                        marginLeft: 'auto',
                        marginRight: 'auto', // Center the avatar horizontally
                    }}
                />
                <label
                    htmlFor="avatar-upload"
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '0',
                        transform: 'translate(50%, 50%)', // Move label 50% of its own width and height, centering it within the avatar
                        cursor: 'pointer',
                    }}
                >
                    <input id="avatar-upload" type="file" style={{ display: 'none' }} onChange={uploadAvatar} disabled={uploading} />
                    <Image src='/edit-icon.png' alt='edit image' width={50} height={50} />
                </label>
            </div>
        </div>
    )
}