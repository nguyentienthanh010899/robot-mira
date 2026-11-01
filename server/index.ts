import { makeServer } from './app';
const port = Number(process.env.PORT || 3001);
makeServer().listen(port, '127.0.0.1', () => console.log(`MIRA API: http://127.0.0.1:${port}`));
