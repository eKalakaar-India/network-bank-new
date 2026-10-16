import { getCards } from '../lib/sheets.js';
import { buildFacets } from '../lib/query.js';
import { route } from '../lib/http.js';

export default route(async () => buildFacets(await getCards()));