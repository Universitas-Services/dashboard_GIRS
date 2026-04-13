import { UniversitasAPI } from 'sdk-global-universitas';

try {
  const sdk = new (UniversitasAPI as any)();
  console.log('SDK initialized without arguments');
} catch (e) {
  console.log('SDK initialization failed without arguments:', e);
}
