'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react';

const Provider = ({ children }: { children: React.ReactNode }) => {
    const { checkAuth, isCheckingAuth, authUser } = useAuthStore();
    const router = useRouter()

    useEffect(() =>{
        console.log("checking auth")
        checkAuth()
    }, [checkAuth])

    useEffect(() => {
        console.log(isCheckingAuth, authUser)
        if (!isCheckingAuth && authUser === null) {
            router.push('/') // send to homepage
        }
    }, [isCheckingAuth, authUser, router])

    return <>{children}</>;
};

export default Provider;
