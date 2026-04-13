import { UniversitasAPI } from 'sdk-global-universitas';

try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sdk = new (UniversitasAPI as any)();
  console.log('SDK initialized without arguments', sdk);
} catch (e) {
  console.log('SDK initialization failed without arguments:', e);
}
