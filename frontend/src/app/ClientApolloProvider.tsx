"use client";
import dynamic from 'next/dynamic';

export const ClientApollo = dynamic(() => import('./providers').then(m => m.Providers), { ssr: false });
