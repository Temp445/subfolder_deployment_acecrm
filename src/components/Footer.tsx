'use client'

import React from 'react';
import { useTranslations } from 'next-intl';
export default function Footer() {
  const t = useTranslations('Footer')
  return (
    <footer className="bg-indigo-600 text-white p-4 text-center xl-container mx-auto">
      <div className=" mx-auto">
        <div className="flex justify-center items-center space-x-2 mb-2">
         {t('Title')}
        </div>
        <div className="text-sm">
          © {new Date().getFullYear()} ACE Software Solutions Private Limited. {t('Rights')}
        </div>
      </div>
    </footer>
  );
};