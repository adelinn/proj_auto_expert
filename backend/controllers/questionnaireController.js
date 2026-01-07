import db from '../config/db.js';
import logger from '../server/logger.js';
import * as exameneRepo from '../repositories/examene.js';
import * as testeRepo from '../repositories/teste.js';

// Test definitions based on category (matching jsonl_to_sql.py)
const TEST_DEFS = {
  "A":  { group: "A, A1, A2, AM", nr: 20, time: 20, min: 17, mainCategory: "A" },
  "A1": { group: "A, A1, A2, AM", nr: 20, time: 20, min: 17, mainCategory: "A" },
  "A2": { group: "A, A1, A2, AM", nr: 20, time: 20, min: 17, mainCategory: "A" },
  "AM": { group: "A, A1, A2, AM", nr: 20, time: 20, min: 17, mainCategory: "A" },
  
  "B":  { group: "B, B1, Tr", nr: 26, time: 30, min: 22, mainCategory: "B" },
  "B1": { group: "B, B1, Tr", nr: 26, time: 30, min: 22, mainCategory: "B" },
  "Tr": { group: "B, B1, Tr", nr: 26, time: 30, min: 22, mainCategory: "B" },
  
  "C":  { group: "C, C1", nr: 26, time: 30, min: 22, mainCategory: "C" },
  "C1": { group: "C, C1", nr: 26, time: 30, min: 22, mainCategory: "C" },
  
  "D":  { group: "D, D1, Tb, Tv", nr: 26, time: 30, min: 22, mainCategory: "D" },
  "D1": { group: "D, D1, Tb, Tv", nr: 26, time: 30, min: 22, mainCategory: "D" },
  "Tb": { group: "D, D1, Tb, Tv", nr: 26, time: 30, min: 22, mainCategory: "D" },
  "Tv": { group: "D, D1, Tb, Tv", nr: 26, time: 30, min: 22, mainCategory: "D" },
  
  "E": { group: "BE, CE, DE", nr: 11, time: 15, min: 9, mainCategory: "E" },
};

// GET /api/chestionare - Lista toate chestionarele utilizatorului
export const getChestionare = async (req, res, next) => {
  const log = req?.log || logger;
  const userId = req.user.id;

  try {
    // Găsește toate examenele utilizatorului
    const examene = await db('examene')
      .select(
        'examene.id_examen',
        'examene.id_test',
        'examene.scor',
        'examene.data',
        'examene.start_time',
        'teste.nume'
      )
      .leftJoin('teste', 'examene.id_test', 'teste.id_test')
      .where('examene.id_user', userId)
      .orderBy('examene.data', 'desc');

    if (examene.length === 0) {
      return res.json([]);
    }

    // OPTIMIZAT: Batch fetch toate statisticile într-o singură rundă
    const examenIds = examene.map(e => e.id_examen);
    const testIds = [...new Set(examene.map(e => e.id_test))];

    // 1. Fetch toate numerele de întrebări pentru toate testele într-o singură interogare
    const intrebariPerTest = await db('chestionare')
      .select('id_test')
      .count('* as total')
      .whereIn('id_test', testIds)
      .groupBy('id_test');

    const intrebariPerTestObj = {};
    for (const row of intrebariPerTest) {
      intrebariPerTestObj[row.id_test] = parseInt(row.total);
    }

    // 2. Fetch toate întrebările răspunse pentru toate examenele într-o singură interogare
    const raspunsePerExamen = await db('raspunsuriXam')
      .select('raspunsuriXam.id_examen')
      .countDistinct('raspunsuriQ.id_intrebare as nr_raspunse')
      .leftJoin('raspunsuriQ', 'raspunsuriXam.id_raspunsQ', 'raspunsuriQ.id_raspunsQ')
      .whereIn('raspunsuriXam.id_examen', examenIds)
      .where('raspunsuriXam.valoare', 1)
      .groupBy('raspunsuriXam.id_examen');

    const raspunsePerExamenObj = {};
    for (const row of raspunsePerExamen) {
      raspunsePerExamenObj[row.id_examen] = parseInt(row.nr_raspunse || 0);
    }

    // Construiește rezultatele folosind datele batch-fetch-uite
    const results = examene.map((examen) => ({
      id: examen.id_examen,
      nume: examen.nume,
      nr_intrebari: intrebariPerTestObj[examen.id_test] || 0,
      nr_raspunse: raspunsePerExamenObj[examen.id_examen] || 0,
      nr_corecte: examen.scor,
      scor: examen.scor,
      data: examen.data,
      inceput: examen.start_time !== null
    }));

    res.json(results);
  } catch (err) {
    log.error({ err, userId }, 'Error fetching user chestionare');
    next(err);
  }
};

// POST /api/chestionare - Creează un chestionar nou (examen) cu întrebări aleatoare
export const createChestionar = async (req, res, next) => {
  const log = req?.log || logger;
  const userId = req.user.id;
  const { categorie } = req.body; // Required category to determine test parameters

  try {
    // Verifică dacă categoria este validă și obține definiția testului
    if (!categorie || !TEST_DEFS.hasOwnProperty(categorie)) {
      return res.status(400).json({
        msg: `Categorie invalidă. Categorii disponibile: ${Object.keys(TEST_DEFS).join(', ')}`
      });
    }

    const testDef = TEST_DEFS[categorie];
    const nr_intrebari = testDef.nr;
    // Găsește toate testele pe care user-ul le-a făcut deja
    const exameneUser = await db('examene')
      .select('id_test')
      .where('id_user', userId)
      .distinct();

    const userTestIds = exameneUser.map(e => e.id_test);

    // Găsește toate întrebările care sunt deja în testele user-ului
    let intrebariFolositeQuery = db('chestionare')
      .select('id_intrebare')
      .distinct();

    if (userTestIds.length > 0) {
      intrebariFolositeQuery = intrebariFolositeQuery.whereIn('id_test', userTestIds);
    } else {
      // Dacă user-ul nu are testele, returnează un array gol pentru a evita eroarea SQL
      intrebariFolositeQuery = intrebariFolositeQuery.whereRaw('1 = 0');
    }

    const intrebariFolosite = await intrebariFolositeQuery;
    const intrebariFolositeIds = intrebariFolosite.map(i => i.id_intrebare);

    // Găsește întrebări disponibile (care nu sunt în testele user-ului)
    let intrebariDisponibileQuery = db('intrebari')
      .select('id_intrebare')
      .where('categorie', testDef.mainCategory);

    if (intrebariFolositeIds.length > 0) {
      intrebariDisponibileQuery = intrebariDisponibileQuery.whereNotIn('id_intrebare', intrebariFolositeIds);
    }

    const intrebariDisponibile = await intrebariDisponibileQuery.limit(nr_intrebari*7);

    // Verifică dacă există suficiente întrebări disponibile
    if (intrebariDisponibile.length < nr_intrebari) {
      return res.status(404).json({
        msg: "Testele tale deja includ toate întrebările disponibile."
      });
    }

    // Selectează întrebări aleatoare
    const intrebariSelectate = [];
    const intrebariDisponibileShuffled = [...intrebariDisponibile].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < nr_intrebari; i++) {
      intrebariSelectate.push(intrebariDisponibileShuffled[i].id_intrebare);
    }

    // Creează un test nou folosind definiția din TEST_DEFS
    const testNou = await testeRepo.create({
      nume: `${testDef.group} - Set *${userTestIds.length+1}`,
      punctajStart: 0,
      punctajMinim: testDef.min,
      timpLimitaS: testDef.time,
      enabled: 1,
      versiune: 2,
      copyOf: null,
      categorie: testDef.mainCategory
    });

    // Adaugă întrebările în test (chestionare)
    const chestionareData = intrebariSelectate.map(id_intrebare => ({
      id_test: testNou.id,
      id_intrebare: id_intrebare,
      valoareQ: 1 // Valoare implicită pentru întrebare
    }));

    await db('chestionare').insert(chestionareData);

    // Creează examenul nou
    const examenNou = await exameneRepo.create({
      id_user: userId,
      id_test: testNou.id,
      data: db.fn.now(),
      start_time: db.fn.now(),
      scor: null,
      durata: testNou.timpLimitaS
    });

    res.status(201).json({
      id: examenNou.id,
      nume: testNou.nume,
      nr_intrebari: intrebariSelectate.length,
      nr_raspunse: 0,
      nr_corecte: 0,
      scor: null,
      data: examenNou.data,
      inceput: false
    });
  } catch (err) {
    log.error({ err, userId }, 'Error creating chestionar');
    next(err);
  }
};

// GET /api/chestionar/:id - Detalii chestionar cu toate întrebările
export const getChestionarById = async (req, res, next) => {
  const log = req?.log || logger;
  const userId = req.user.id;
  const examenId = parseInt(req.params.id);

  try {
    // Verifică ownership
    const examen = await db('examene')
      .select('*')
      .where('id_examen', examenId)
      .first();

    if (!examen) {
      return res.status(404).json({ msg: 'Chestionarul nu a fost găsit' });
    }

    if (examen.id_user !== userId) {
      return res.status(403).json({ msg: 'Nu aveți acces la acest chestionar' });
    }

    // Găsește toate întrebările din test
    const intrebari = await db('chestionare')
      .select(
        'intrebari.id_intrebare',
        'intrebari.text',
        'intrebari.id_poza',
        'intrebari.tipQ_1xR',
        'chestionare.valoareQ',
        'pozeQ.uri as poza_url'
      )
      .leftJoin('intrebari', 'chestionare.id_intrebare', 'intrebari.id_intrebare')
      .leftJoin('pozeQ', 'intrebari.id_poza', 'pozeQ.id_poza')
      .where('chestionare.id_test', examen.id_test)
      .orderBy('chestionare.id');

    // Pentru fiecare întrebare, adaugă variante și răspunsuri date
    const intrebariComplete = await Promise.all(
      intrebari.map(async (intrebare) => {
        // Variante de răspuns
        const variante = await db('raspunsuriQ')
          .select('id_raspunsQ as id', 'text', 'corect')
          .where('id_intrebare', intrebare.id_intrebare);

        // Răspunsurile date de user pentru această întrebare
        const raspunsuriDate = await db('raspunsuriXam')
          .select('raspunsuriXam.id_raspunsQ')
          .leftJoin('raspunsuriQ', 'raspunsuriXam.id_raspunsQ', 'raspunsuriQ.id_raspunsQ')
          .where('raspunsuriXam.id_examen', examenId)
          .where('raspunsuriQ.id_intrebare', intrebare.id_intrebare)
          .where('raspunsuriXam.valoare', 1);

        const raspunsCorectId = variante.find(v => v.corect === 1)?.id || null;

        return {
          id: intrebare.id_intrebare,
          text: intrebare.text,
          poza_url: intrebare.poza_url,
          tip_multiplu: intrebare.tipQ_1xR === 0, // 0 = multiple choice, 1 = single choice
          punctaj: intrebare.valoareQ,
          variante: variante.map(v => ({
            id: v.id,
            text: v.text,
            corect: v.corect // Include și varianta corectă
          })),
          raspuns_corect_id: raspunsCorectId,
          raspunsuri_date: raspunsuriDate.map(r => r.id_raspunsQ)
        };
      })
    );

    // Info test
    const test = await db('teste')
      .select('nume', 'punctajMinim', 'timpLimitaS')
      .where('id_test', examen.id_test)
      .first();

    res.json({
      id: examen.id_examen,
      nume: test.nume,
      punctaj_minim: test.punctajMinim,
      timp_limita_secunde: test.timpLimitaS,
      scor_curent: examen.scor,
      start_time: examen.start_time,
      intrebari: intrebariComplete
    });
  } catch (err) {
    log.error({ err, userId, examenId }, 'Error fetching chestionar details');
    next(err);
  }
};

// POST /api/chestionar/:id/intrebare/:id_intrebare - Răspunde la o întrebare
export const answerQuestion = async (req, res, next) => {
  const log = req?.log || logger;
  const userId = req.user.id;
  const examenId = parseInt(req.params.id);
  const intrebareId = parseInt(req.params.id_intrebare);
  const { raspunsuri } = req.body; // Array de id_raspunsQ

  try {
    // Validare input
    if (!Array.isArray(raspunsuri) || raspunsuri.length === 0) {
      return res.status(400).json({ msg: 'Trebuie să selectați cel puțin un răspuns' });
    }

    // Verifică ownership examen
    const examen = await db('examene')
      .select('*')
      .where('id_examen', examenId)
      .first();

    if (!examen) {
      return res.status(404).json({ msg: 'Examenul nu a fost găsit' });
    }

    if (examen.id_user !== userId) {
      return res.status(403).json({ msg: 'Nu aveți acces la acest examen' });
    }

    // Verifică tipul întrebării
    const intrebare = await db('intrebari')
      .select('tipQ_1xR')
      .where('id_intrebare', intrebareId)
      .first();
    
    if (!intrebare) {
      return res.status(404).json({ msg: 'Întrebarea nu a fost găsită' });
    }

    // Limitare dezactivata ca sa fim consistenti cu testerul de pe DRPCIV care are multiple la toate
    // // Validare: dacă e single choice (tipQ_1xR = 1), permitem doar 1 răspuns
    // if (intrebare.tipQ_1xR === 1 && raspunsuri.length > 1) {
    //   return res.status(400).json({ 
    //     msg: 'Această întrebare permite un singur răspuns' 
    //   });
    // }

    // Obține TOATE răspunsurile pentru această întrebare (pentru validare, ștergere și răspunsuri corecte) - OPTIMIZAT: 1 query în loc de 3
    const toateRaspunsuriIntrebare = await db('raspunsuriQ')
      .select('id_raspunsQ', 'corect')
      .where('id_intrebare', intrebareId);

    // Verifică că toate răspunsurile selectate aparțin acestei întrebări - OPTIMIZAT
    const raspunsuriIdsIntrebare = toateRaspunsuriIntrebare.map(r => r.id_raspunsQ);
    const raspunsuriIdsIntrebareSet = new Set(raspunsuriIdsIntrebare);
    const raspunsuriIdsSelectateSet = new Set(raspunsuri);
    const raspunsuriInvalideSet = raspunsuriIdsSelectateSet.difference(raspunsuriIdsIntrebareSet);
    
    if (raspunsuriInvalideSet.size > 0) {
      return res.status(400).json({ msg: 'Răspunsuri invalide' });
    }

    // Obține ID-urile pentru ștergere mai tarziu
    const raspunsuriIdsToDelete = raspunsuriIdsIntrebare;

    // IMPORTANT: Găsește TOATE răspunsurile corecte pentru această întrebare - OPTIMIZAT: Set pentru comparație eficientă
    const raspunsuriIdsCorecteSet = new Set(
      toateRaspunsuriIntrebare
        .filter(r => r.corect === 1)
        .map(r => r.id_raspunsQ)
    );

    // Verifică dacă răspunsul e corect - OPTIMIZAT: Set equality check (O(n) în loc de O(n log n) cu sort)
    // Seturile sunt egale dacă au aceeași dimensiune și toate elementele din unul sunt în celălalt
    const eCorect = raspunsuriIdsCorecteSet.size === raspunsuriIdsSelectateSet.size &&
                    raspunsuriIdsCorecteSet.difference(raspunsuriIdsSelectateSet).size == 0;

    // TRANSACȚIE: șterge răspunsuri vechi + inserează noi + update scor
    let scorNou = 0;
    await db.transaction(async (trx) => {
      // 1. Șterge răspunsurile vechi pentru această întrebare (optimizat: fără subquery)
      if (raspunsuriIdsToDelete.length > 0) {
        await trx('raspunsuriXam')
          .whereIn('id_raspunsQ', raspunsuriIdsToDelete)
          .where('id_examen', examenId)
          .del();
      }

      // 2. Inserează noile răspunsuri
      const insertData = raspunsuri.map(id_raspunsQ => ({
        id_examen: examenId,
        id_raspunsQ: id_raspunsQ,
        valoare: 1
      }));
      await trx('raspunsuriXam').insert(insertData);

      // 3. Setează start_time dacă e primul răspuns
      if (!examen.start_time) {
        await trx('examene')
          .where('id_examen', examenId)
          .update({ start_time: trx.fn.now() });
      }

      // 4. Recalculează scorul total - OPTIMIZAT: 2 interogări în loc de O(n)
      // Găsește toate întrebările din test
      const intrebariTest = await trx('chestionare')
        .select('id_intrebare')
        .where('id_test', examen.id_test);

      const intrebareIds = intrebariTest.map(i => i.id_intrebare);

      // Fetch TOATE răspunsurile corecte pentru TOATE întrebările din test într-o singură interogare
      const toateRaspunsuriCorecte = await trx('raspunsuriQ')
        .select('id_raspunsQ', 'id_intrebare')
        .whereIn('id_intrebare', intrebareIds)
        .where('corect', 1);

      // Fetch TOATE răspunsurile date de user pentru acest examen într-o singură interogare
      const toateRaspunsuriUser = await trx('raspunsuriXam')
        .select('raspunsuriXam.id_raspunsQ', 'raspunsuriQ.id_intrebare')
        .leftJoin('raspunsuriQ', 'raspunsuriXam.id_raspunsQ', 'raspunsuriQ.id_raspunsQ')
        .where('raspunsuriXam.id_examen', examenId)
        .where('raspunsuriXam.valoare', 1)
        .whereIn('raspunsuriQ.id_intrebare', intrebareIds);

      // Grupează răspunsurile corecte pe întrebare - OPTIMIZAT: Map pentru performanță mai bună
      const raspunsCorectePeIntrebare = new Map();
      for (const r of toateRaspunsuriCorecte) {
        if (!raspunsCorectePeIntrebare.has(r.id_intrebare)) {
          raspunsCorectePeIntrebare.set(r.id_intrebare, new Set());
        }
        raspunsCorectePeIntrebare.get(r.id_intrebare).add(r.id_raspunsQ);
      }

      // Grupează răspunsurile user pe întrebare - OPTIMIZAT: Map cu Set-uri
      const raspunsUserPeIntrebare = new Map();
      for (const r of toateRaspunsuriUser) {
        if (!r.id_intrebare) continue; // Skip if join failed
        if (!raspunsUserPeIntrebare.has(r.id_intrebare)) {
          raspunsUserPeIntrebare.set(r.id_intrebare, new Set());
        }
        raspunsUserPeIntrebare.get(r.id_intrebare).add(r.id_raspunsQ);
      }

      // Calculează scorul comparând răspunsurile - OPTIMIZAT: Set equality (O(n) în loc de O(n log n))
      for (const id_intrebare of intrebareIds) {
        const correctSet = raspunsCorectePeIntrebare.get(id_intrebare) || new Set();
        const userSet = raspunsUserPeIntrebare.get(id_intrebare) || new Set();

        // Compară: trebuie să fie identice (toate corecte, niciun greșit, niciun lipsă)
        // Set equality: aceeași dimensiune și toate elementele din unul sunt în celălalt
        if (correctSet.size === userSet.size &&
            correctSet.difference(userSet).size == 0) {
          scorNou++;
        }
      }

      // 5. Update scor în examene
      await trx('examene')
        .where('id_examen', examenId)
        .update({ scor: scorNou });
    });

    // Găsește răspunsul corect pentru explicație - OPTIMIZAT: folosește Set-ul deja creat
    const raspunsuriCorecte = raspunsuriIdsCorecteSet.size > 0
      ? await db('raspunsuriQ')
          .select('text')
          .whereIn('id_raspunsQ', Array.from(raspunsuriIdsCorecteSet))
      : [];

    res.json({
      corect: eCorect,
      scor_total: scorNou,
      explicatie: eCorect 
        ? 'Răspuns corect!' 
        : `Răspunsul corect: ${raspunsuriCorecte.map(r => r.text).join(', ')}`
    });

  } catch (err) {
    log.error({ err, userId, examenId, intrebareId }, 'Error answering question');
    next(err);
  }
};

export default {
  getChestionare,
  createChestionar,
  getChestionarById,
  answerQuestion
};
