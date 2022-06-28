//// Modules ////
import { db, ref, onValue, set, off, get, query, orderByChild, limitToLast } from './modules/firebaseConnection';
import header from './modules/header';
import rooms from './modules/rooms';
import table from './modules/table';
import myAlert from './modules/others';

header(db, ref, set, get, myAlert)
rooms(db, ref, set, onValue, off)
table(db, ref, get, query, orderByChild, limitToLast)

