import { UniversitasAPI } from 'sdk-global-universitas';

const baseURL = process.env.NEXT_PUBLIC_UNIVERSITAS_SDK_URL || 'https://api-global-universitas.onrender.com';

export const sdk = new UniversitasAPI(baseURL);
