import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <main className="privacy-policy" style={{padding: '2rem', maxWidth: 880, margin: '0 auto', color: 'var(--color-beige-100)'}}>
      <article style={{background: 'rgba(8,10,14,0.36)', padding: '2rem', borderRadius: 12, boxShadow: '0 18px 60px rgba(2,6,23,0.6)'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:16}}>
          <div>
            <h1 style={{marginTop:0}}>Politica de confidențialitate — Semni</h1>
            <p style={{opacity:0.92, margin:0}}>Data intrării în vigoare: 18 decembrie 2025</p>
          </div>

          <div style={{display:'flex', gap:8}}>
            <button onClick={() => window.print()} className="btn-download" style={{background: 'linear-gradient(90deg,#06b6d4,#3b82f6)', color:'#fff', border:'none', padding:'8px 12px', borderRadius:8, fontWeight:700}}>Descarcă (PDF)</button>
            <Link to="/login" style={{color:'rgba(255,255,255,0.88)'}}>Închide</Link>
          </div>
        </div>

        <h2>Introducere</h2>
        <p>
          Semni (denumită în continuare „Noi”, „Aplicația” sau „Semni”) se angajează să protejeze
          confidențialitatea utilizatorilor. Această politică descrie ce tipuri de date colectăm,
          motivele pentru care le folosim, cum le protejăm și ce drepturi au utilizatorii în legătură cu
          informațiile lor personale. Conținutul politicii este formulat clar pentru a fi ușor de
          înțeles, oportun și aplicabil în contextul unei aplicații web educaționale.
        </p>

        <h2>Ce date colectăm</h2>
        <p>
          Colectăm numai datele necesare pentru a furniza serviciile noastre și pentru a îmbunătăți
          experiența de utilizare. Datele pot include atât informații pe care ni le furnizați
          direct, cât și informații colectate automat.
        </p>
        <ul>
          <li>
            Date de identificare: nume, prenume, adresă de email, număr de telefon (opțional) și date
            de autentificare, în cazul în care creați un cont.
          </li>
          <li>
            Date academice și de utilizare: programe urmate, note, progres în cursuri, preferințe de
            învățare și activitate în aplicație (log-uri, resurse vizualizate, răspunsuri la chestionare).
          </li>
          <li>
            Date tehnice: adresă IP, tipul și versiunea browserului, informații despre dispozitiv,
            sistem de operare, informații despre erori și jurnale de server, date de performanță.
          </li>
          <li>
            Date colectate prin cookie-uri și tehnologii similare (detalii la secțiunea „Cookie-uri”).
          </li>
        </ul>

        <h2>Cum folosim datele</h2>
        <p>
          Datele dumneavoastră sunt folosite în scopuri clare, legitime și proporționale cu nevoile
          serviciului. Principalele scopuri includ:
        </p>
        <ul>
          <li>furnizarea și operarea contului și a funcționalităților aplicației;</li>
          <li>personalizarea conținutului didactic și recomandărilor de cursuri;</li>
          <li>monitorizarea progresului și generarea de rapoarte de evaluare;</li>
          <li>îmbunătățirea produsului prin analiza statistică anonimă a utilizării;</li>
          <li>comunicări administrative, informări legate de cont sau de modificări ale serviciilor;</li>
          <li>respectarea obligațiilor legale sau răspunsul la solicitări autorităților competente.</li>
        </ul>
        <p>
          Bazele legale pentru prelucrare pot include: consimțământul utilizatorului, executarea unui
          contract, respectarea unei obligații legale sau interesul legitim al Semni (de exemplu
          pentru asigurarea securității serviciului și pentru îmbunătățirea produsului).
        </p>

        <h2>Cookie-uri și tehnologii similare</h2>
        <p>
          Folosim cookie-uri și tehnologii similare pentru a îmbunătăți funcționalitatea și
          performanța aplicației, pentru a analiza modul în care este utilizată aplicația și pentru a
          oferi funcționalități esențiale. Tipurile principale de cookie-uri utilizate sunt:
        </p>
        <ul>
          <li>
            Cookie-uri esențiale: necesare pentru funcționarea platformei (de ex. cookie-uri de
            autentificare și sesiune);
          </li>
          <li>
            Cookie-uri de performanță: colectează informații anonime despre modul în care utilizatorii
            folosesc aplicația (ex: pagini accesate, erori tehnice);
          </li>
          <li>
            Cookie-uri funcționale: păstrează preferințele setate de utilizator pentru o experiență
            mai bună (ex: limbă, setări interfată);
          </li>
          <li>
            Cookie-uri de marketing și analytic (opțional): susțin analize atente și îmbunătățiri și
            pot fi folosite de terți pentru statistici anonime.
          </li>
        </ul>
        <p>
          Puteți gestiona preferințele privind cookie-urile din setările browserului sau din
          interfața de consimțământ oferită în aplicație. Rețineți că dezactivarea anumitor cookie-uri
          poate limita funcționalitatea aplicației.
        </p>

        <h2>Stocarea și securitatea datelor</h2>
        <p>
          Implementăm măsuri tehnice și organizatorice adecvate pentru a proteja datele personale
          împotriva accesului neautorizat, pierderii, modificării sau divulgării. Măsurile includ:
        </p>
        <ul>
          <li>criptarea datelor sensibile în tranzit (TLS) și, acolo unde este necesar, în repaus;</li>
          <li>controlul strict al accesului intern pe principiul minimului privilegiu;</li>
          <li>aplicarea de politici de backup și planuri de recuperare în caz de incident;</li>
          <li>monitorizare și audit periodic al sistemelor pentru detectarea activităților anormale.</li>
        </ul>
        <p>
          Datele sunt găzduite în centre de date sigure, cu furnizori de încredere; în cazul în care
          datele sunt transferate în afara Spațiului Economic European (dacă este cazul), vom asigura
          existența garanțiilor adecvate (de ex. clauze contractuale standard sau decizii adecvate de
          transfer) și informarea corespunzătoare a utilizatorului.
        </p>

        <h2>Drepturile utilizatorului (GDPR)</h2>
        <p>
          Dacă locuiți în Uniunea Europeană sau sunteți rezident protejat de Regulamentul GDPR, aveți
          anumite drepturi referitoare la datele personale. Printre acestea se numără:
        </p>
        <ul>
          <li>
            Dreptul de acces: puteți solicita confirmarea dacă prelucrăm datele dvs. și o copie a
            acestora.
          </li>
          <li>
            Dreptul de rectificare: puteți solicita corectarea datelor inexacte sau completarea celor
            incomplete.
          </li>
          <li>
            Dreptul la ștergere („dreptul de a fi uitat”), în anumite condiții legale.
          </li>
          <li>
            Dreptul la restricționarea prelucrării: puteți cere limitarea unor tipuri de prelucrări.
          </li>
          <li>
            Dreptul la portabilitatea datelor: aveți dreptul să primiți datele într-un format structurat
            și să le transmiteți către un alt operator, atunci când este aplicabil.
          </li>
          <li>
            Dreptul de opoziție: puteți obiecta la prelucrarea pe baza interesului legitim sau la
            marketing direct.
          </li>
        </ul>
        <p>
          Pentru a exercita orice drept, ne puteți contacta la datele de contact de mai jos. Răspundem
          cererilor în mod transparent și, în limitele legii, în termenul legal aplicabil; este posibil
          să solicităm informații suplimentare pentru a verifica identitatea solicitantului.
        </p>

        <h2>Partajarea datelor cu terți</h2>
        <p>
          Putem partaja datele personale cu prestatori de servicii care ne sprijină tehnic sau
          operațional (de ex. furnizori de hosting, servicii de email, platforme de analiză), dar și
          cu terți autorizați în baza cerințelor legale. De regulă, astfel de terți acționează în
          calitate de procesatori de date și sunt obligați contractual să respecte confidențialitatea
          și securitatea datelor.
        </p>
        <ul>
          <li>Furnizori de infrastructură (hosting, baze de date)</li>
          <li>Furnizori de servicii de analiză (ex: Google Analytics, la opțiunea utilizatorului)</li>
          <li>Servicii de comunicare și notificări (email, SMS)</li>
        </ul>

        <h2>Perioada de păstrare</h2>
        <p>
          Păstrăm datele doar atât timp cât este necesar pentru scopurile pentru care au fost colectate
          sau conform obligațiilor legale. Exemple orientative:
        </p>
        <ul>
          <li>datele contului: pe durata activă a contului și 1-3 ani după dezactivare pentru scopuri
            administrative și legale, după caz;</li>
          <li>date tehnice și de jurnalizare: perioade rotative (de obicei 6–24 luni) pentru diagnostic
            și securitate, cu arhivare anonimizată posibilă pentru analize statistice pe termen lung;</li>
          <li>date legate de tranzacții sau facturare: conform legislației contabile și fiscale aplicabile.</li>
        </ul>

        <h2>Modificări ale politicii</h2>
        <p>
          Putem actualiza această politică în mod periodic. Vom publica versiunea actualizată în aplicație
          și vom afișa data ultimei modificări. Dacă schimbările sunt semnificative, vom informa
          utilizatorii prin email sau notificare în aplicație, după caz.
        </p>

        <h2>Date de contact</h2>
        <p>
          Pentru întrebări, cereri privind datele personale sau pentru a exercita drepturile menționate
          mai sus, ne puteți contacta la:
        </p>
        <ul>
          <li>Email: privacy@semni.example</li>
          <li>Adresă: Str. Exemplu 123, Localitate, Țară</li>
        </ul>

        <h2>Notă finală</h2>
        <p>
          Semni își ia angajamentul de a menține un nivel înalt de protecție a datelor personale și de a
          respecta legislația aplicabilă. Dacă aveți întrebări sau sugestii, nu ezitați să ne contactați
          — apreciem feedback-ul care ne ajută să îmbunătățim serviciile pentru toți utilizatorii.
        </p>
      </article>
    </main>
  );
}
