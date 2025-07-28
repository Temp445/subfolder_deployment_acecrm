'use client';

import React, { FormEvent, useRef, useState } from "react";
import { MdOutlineMail, MdAddIcCall } from "react-icons/md";
import emailjs from "@emailjs/browser";
import { sendWhatsappMessage } from "../services/whatsapp/whatsappService";

import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import 'react-phone-number-input/style.css';
import { eventTracking } from "@/lib/gtm";
import { useTranslations } from "next-intl";
import { CountryCode } from 'libphonenumber-js';

const service_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const template_ID = process.env.NEXT_PUBLIC_EMAILJS_ENQ_TEMPLATE_ID!;
const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

// const LI_ENQ_CONVERSION_LABEL = process.env.NEXT_PUBLIC_LI_ENQ_CONVERSION_ID!;
// if (!LI_ENQ_CONVERSION_LABEL) {
//   console.error('❌ LinkedIn Conversion Label missing. Set NEXT_PUBLIC_LI_ENQ_CONVERSION_ID in .env.');
// }

const endpoint = '/api/proxy-validate-email';

const ProductEnquire: React.FC = () => {
  const t = useTranslations('ProductEnquire');
  const countryCode = t('code') as CountryCode || 'IN';

  const form = useRef<HTMLFormElement | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>("");
  const [phone, setPhone] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const validateEmail = async (email: string): Promise<string> => {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });


      if (response.status !== 200) return t('EmailError');

      const data = await response.json();
      if (data.success) {
        return data.isValid ? '' : t('EmailError');
      } else {
        return (` Failed: ${data.error}`);
      }
    } catch (err) {
      console.error('Email validation error:', err);
      return t('ValidationUnavailable');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const formCurrent = form.current;
    if (!formCurrent) return;

    const emailValidationMessage = await validateEmail(email);
    if (emailValidationMessage) {
      setEmailError(emailValidationMessage);
      return;
    } else {
      setEmailError('');
    }

    if (!phone || !isValidPhoneNumber(phone)) {
      setPhoneError(t('PhoneError'));
      return;
    } else {
      setPhoneError('');
    }

    // form submission tracking
    eventTracking({
      action: 'form_submission',
      category: 'engagement',
      label: 'Enquiry Form',
    })

    const phoneWithoutPlus = phone.replace(/[\s+]/g, '');

    const formData = {
      Full_Name: (formCurrent['Name'] as HTMLInputElement)?.value || '',
      Company_Name: formCurrent['company']?.value || '',
      Business_Email: email,
      Mobile_Number: phoneWithoutPlus,
      Location: formCurrent['location']?.value || '',
      Message: formCurrent['queries']?.value || '',
      Product_Interested: formCurrent['product']?.value || '',
      Originate_From: 'Ace CRM',
    };

    setLoading(true);

    try {
      await emailjs.send(service_ID, template_ID, formData, publicKey);
      alert(t('Success'));
      formCurrent.reset();
      setEmail('');
      setPhone('');
    } catch (error) {
      console.error('Email sending failed:', error);
      alert(t('Failure'));
    } finally {
      setLoading(false);
    }

    try {
      await sendWhatsappMessage(
        "enquiry_form",
        {
          originateFrom: formData.Originate_From,
          fullName: formData.Full_Name,
          companyName: formData.Company_Name,
          businessEmail: formData.Business_Email,
          mobileNumber: formData.Mobile_Number,
          location: formData.Location,
          productInterest: formData.Product_Interested,
          message: formData.Message,
        },
      );

      await sendWhatsappMessage(
        'customer_greetings',
        {
          fullName: formData.Full_Name,
          product: formData.Product_Interested,
          siteUrl: 'https://acesoft.in',
          imageUrl:
            'https://res.cloudinary.com/dohyevc59/image/upload/v1749124753/Enquiry_Greetings_royzcm.jpg',
        },
        phoneWithoutPlus,
      );
    } catch (error) {
      console.error('WhatsApp sending error:', error);
    }
  };

  return (
    <div className="relative container mx-auto">
      <div className="relative flex flex-col-reverse gap-6 max-w-8xl mx-auto">
        <div className="min-h-screen pb-10 lg:py-12 px-2 md:px-4" id="contact">
          <div className="relative max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 border border-gray-200 ">
            <h1 className="md:text-2xl font-bold text-center mb-6">{t('Title')}</h1>

            <form ref={form} onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('Name')}:
                </label>
                <input
                  id="name"
                  name="Name"
                  type="text"
                  required
                  placeholder={`${t('NamePlaceholder')} *`}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  {t('Company')}:
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  placeholder={`${t('CompanyPlaceholder')} *`}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('Email')}:
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={`${t('EmailPlaceholder')} *`}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>

              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                  {t('Mobile')}:
                </label>
                <PhoneInput
                  international
                  defaultCountry={countryCode}
                  name="number"
                  value={phone}
                  onChange={setPhone}
                  required
                  className=" !shadow-none  !bg-transparent rounded-md border border-gray-300 mt-1 p-2 [&>input]:border-none [&>input]:outline-none [&>input]:bg-transparent"
                />
                {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  {t('Location')}:
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  placeholder={`${t('LocationPlaceholder')} *`}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full items-center">
                <label className="block text-sm font-medium text-gray-700 ">
                  {t('Product')}:
                </label>
                <input
                  type="text"
                  name="product"
                  defaultValue="ACE CRM"
                  readOnly
                  className="text-sm font-bold py-1"
                  aria-label="Product Interested"
                />
              </div>

              <div>
                <label htmlFor="queries" className="block text-sm font-medium text-gray-700">
                  {t('Queries')}:
                </label>
                <textarea
                  id="queries"
                  name="queries"
                  rows={3}
                  placeholder={`${t('QueriesPlaceholder')}`}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white text-[14px] px-3 py-2 md:px-5 md:py-2.5 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2"
                  disabled={loading}
                >
                  {loading ? t('Submitting') : t('Submit')}

                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="order-1 mx-auto relative lg:absolute  rounded-lg lg:rounded-none md:w-[385px]  w-[350px] lg:top-0 lg:right-2 bg-indigo-600 p-1 lg:p-3 lg:w-[200px] lg:rounded-t-2xl lg:rounded-br-2xl shadow-lg shadow-indigo-400 hover:shadow-indigo-600">
          <div className="text-white text-center my-2 text-[16px] lg:text-lg font-bold">{t('ContactUs')} :</div>
          <div className="px-2 ml-5  md:ml-12 lg:ml-0 flex gap-5 lg:px-0 lg:gap-0 lg:flex-col">
            <div className="text-white my-2 flex text-[14px] lg:text-lg gap-1">
              <MdAddIcCall className="mt-1 lg:mt-1.5" />+91 9840137210
            </div>
            <div className="text-white flex text-[14px] lg:text-lg gap-2 mt-2 lg:mt-0">
              <MdOutlineMail className="mt-1 lg:mt-1.5" /> sales@acesoft.in
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEnquire;
