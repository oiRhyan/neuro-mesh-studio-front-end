'use server'
import 'server-only';
import axios from 'axios';
import { cookies } from 'next/headers';
import https from 'https'; // <-- Importe do Node

export async function getApiClient() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    const api = axios.create({
        baseURL: 'https://neuromeshstudio-g2gba3chgehkgncv.brazilsouth-01.azurewebsites.net/api',
        timeout: 120000,
        headers: {
            'Content-Type': 'application/json',
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false 
        })
    });

    api.interceptors.request.use((config) => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    return api;
}