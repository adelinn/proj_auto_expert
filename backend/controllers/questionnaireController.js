import db from '../config/db.js';
import logger from '../server/logger.js';
import * as exameneRepo from '../repositories/examene.js';

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

    // Pentru fiecare examen, calculează statistici
    const results = await Promise.all(
      examene.map(async (examen) => {
        // Număr total de întrebări din test
        const [{ total }] = await db('chestionare')
          .count('* as total')
          .where('id_test', examen.id_test);

        // Număr de întrebări răspunse (distinct)
        const raspunseQuery = await db('raspunsuriXam')
          .countDistinct('raspunsuriQ.id_intrebare as nr_raspunse')
          .leftJoin('raspunsuriQ', 'raspunsuriXam.id_raspunsQ', 'raspunsuriQ.id_raspunsQ')
          .where('raspunsuriXam.id_examen', examen.id_examen)
          .where('raspunsuriXam.valoare', 1)
          .first();

        // Număr de răspunsuri corecte
        const corecteQuery = await db('raspunsuriXam')
          .count('* as nr_corecte')
          .leftJoin('raspunsuriQ', 'raspunsuriXam.id_raspunsQ', 'raspunsuriQ.id_raspunsQ')
          .where('raspunsuriXam.id_examen', examen.id_examen)
          .where('raspunsuriXam.valoare', 1)
          .where('raspunsuriQ.corect', 1)
          .first();

        return {
          id: examen.id_examen,
          nume: examen.nume,
          nr_intrebari: parseInt(total),
          nr_raspunse: parseInt(raspunseQuery?.nr_raspunse || 0),
          nr_corecte: parseInt(corecteQuery?.nr_corecte || 0),
          scor: examen.scor,
          data: examen.data,
          inceput: examen.start_time !== null
        };
      })
    );

    res.json(results);
  } catch (err) {
    log.error({ err, userId }, 'Error fetching user chestionare');
    next(err);
  }
};

// POST /api/chestionare - Creează un chestionar nou (examen)
export const createChestionar = async (req, res, next) => {
  const log = req?.log || logger;
  const userId = req.user.id;

  try {
    // Găsește primul test enabled care NU a fost făcut de user
    const testDisponibil = await db('teste')
      .select('*')
      .where('enabled', 1)
      .whereNotIn('id_test', function () {
        this.select('id_test')
          .from('examene')
          .where('id_user', userId);
      })
      .orderBy('id_test')
      .first();

    if (!testDisponibil) {
      return res.status(404).json({ 
        msg: 'Nu mai există chestionare disponibile. Ai completat toate testele!' 
      });
    }

    // Creează examenul nou
    const examenNou = await exameneRepo.create({
      id_user: userId,
      id_test: testDisponibil.id_test,
      data: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      start_time: null,
      scor: null,
      durata: testDisponibil.timpLimitaS
    });

    // Număr total de întrebări din test
    const [{ total }] = await db('chestionare')
      .count('* as total')
      .where('id_test', testDisponibil.id_test);

    res.status(201).json({
      id: examenNou.id,
      nume: testDisponibil.nume,
      nr_intrebari: parseInt(total),
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

    // Validare: dacă e single choice (tipQ_1xR = 1), permitem doar 1 răspuns
    if (intrebare.tipQ_1xR === 1 && raspunsuri.length > 1) {
      return res.status(400).json({ 
        msg: 'Această întrebare permite un singur răspuns' 
      });
    }

    // Verifică că toate răspunsurile aparțin acestei întrebări
    const raspunsuriValide = await db('raspunsuriQ')
      .select('id_raspunsQ', 'corect')
      .where('id_intrebare', intrebareId)
      .whereIn('id_raspunsQ', raspunsuri);

    if (raspunsuriValide.length !== raspunsuri.length) {
      return res.status(400).json({ msg: 'Răspunsuri invalide' });
    }

    // TRANSACȚIE: șterge răspunsuri vechi + inserează noi + update scor
    await db.transaction(async (trx) => {
      // 1. Șterge răspunsurile vechi pentru această întrebare
      await trx('raspunsuriXam')
        .whereIn('id_raspunsQ', function() {
          this.select('id_raspunsQ')
            .from('raspunsuriQ')
            .where('id_intrebare', intrebareId);
        })
        .where('id_examen', examenId)
        .del();

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

      // 4. Recalculează scorul total
      const scorQuery = await trx('raspunsuriXam')
        .count('* as nr_corecte')
        .leftJoin('raspunsuriQ', 'raspunsuriXam.id_raspunsQ', 'raspunsuriQ.id_raspunsQ')
        .where('raspunsuriXam.id_examen', examenId)
        .where('raspunsuriXam.valoare', 1)
        .where('raspunsuriQ.corect', 1)
        .first();

      const scorNou = parseInt(scorQuery.nr_corecte || 0);

      // 5. Update scor în examene
      await trx('examene')
        .where('id_examen', examenId)
        .update({ scor: scorNou });
    });

    // Verifică dacă răspunsul e corect
    const eCorect = raspunsuriValide.every(r => r.corect === 1) && 
                    raspunsuriValide.length === raspunsuri.length;

    // Găsește răspunsul corect pentru explicație
    const raspunsuriCorecte = await db('raspunsuriQ')
      .select('text')
      .where('id_intrebare', intrebareId)
      .where('corect', 1);

    // Scor actualizat
    const examenActualizat = await db('examene')
      .select('scor')
      .where('id_examen', examenId)
      .first();

    res.json({
      corect: eCorect,
      scor_total: examenActualizat.scor,
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
