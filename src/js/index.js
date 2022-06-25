//// Modules ////
import { db, ref, onValue, set, off, get } from './modules/firebaseConnection';
import header from './modules/header';
import rooms from './modules/rooms';
import myAlert from './modules/others';

header(db, ref, set, get, myAlert)
rooms(db, ref, set, onValue, off)

