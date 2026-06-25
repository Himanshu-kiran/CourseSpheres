import prisma from './src/lib/prisma.js';
import { generateCertificate } from './src/services/certificateService.js';

async function test() {
  try {
    const userId = 'c9074182-dc92-4f78-afb8-9da8be5cde03';
    const courseId = '53eb7619-51b7-4dec-8d06-7e410983767b';
    console.log('Generating certificate...');
    const cert = await generateCertificate(userId, courseId);
    console.log('Success!', cert);
  } catch (error) {
    console.error('Failed!', error);
  } finally {
    await prisma.$disconnect();
  }
}
test();
