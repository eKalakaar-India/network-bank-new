import { getCards } from '../lib/sheets.js';
import { queryCards } from '../lib/query.js';
import { route } from '../lib/http.js';

export default route(async (req) => queryCards(await getCards(), req.query));