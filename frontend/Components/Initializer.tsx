'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useEffect } from 'react';

const Initializer = ({ rates, accounts, transactions } : {rates?: boolean, accounts?: boolean, transactions?: boolean}) => {
    const { getRates, getAccounts, getTransactionsWithFilter } = useTransactionStore();
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        // Fetch all initial data from one place
        checkAuth()
        rates && getRates()
        accounts && getAccounts();
        transactions && getTransactionsWithFilter({user: true});
    }, [checkAuth, getRates, getAccounts, getTransactionsWithFilter]); // Add dependencies

    return null; // This component doesn't render anything
};

export default Initializer;
