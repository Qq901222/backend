import bcrypt from 'bcrypt';

const raw = '123456';
const hash = '$2b$10$2xjsMVgOHTDlijXyUA4U3eN.QvXzkWo13FdY0stcFjNbERkzDw3S6';

(async () => {
  const result = await bcrypt.compare(raw, hash);
  console.log('✅ compare result:', result);
})();
