/**
 * WEBSITE PROFIL PERUSAHAAN + INFOGRAFIS K3
 * Google Apps Script + Google Spreadsheet
 *
 * Instalasi:
 * 1. Buat Google Spreadsheet kosong.
 * 2. Extensions > Apps Script.
 * 3. Tempel file ini sebagai Code.gs dan buat file HTML bernama Index.
 * 4. Jalankan setup() sekali.
 * 5. Deploy sebagai Web App: Execute as Me; Who has access Anyone.
 *
 * Login awal: admin / GantiAdminK3!2026
 * Ganti password segera setelah instalasi.
 */

const CFG = {
  title: 'Profil Perusahaan',
  sheets: {
    Users: ['id','username','passwordHash','role','active'],
    ProfilPerusahaan: ['id','nama','tagline','logoUrl','bannerUrl','sejarah','visi','misi','sektor','tahunBerdiri','alamat','kota','telepon','email','website','jumlahPekerja','tingkatBahaya','potensiBahaya','updatedAt'],
    Layanan: ['id','nama','deskripsi','gambarUrl','aktif','urutan'],
    StrukturOrganisasi: ['id','nama','jabatan','fotoUrl','urutan','aktif'],
    Galeri: ['id','judul','deskripsi','gambarUrl','tanggal','aktif'],
    Kontak: ['id','alamat','telepon','email','website','mapsUrl','instagram','facebook','whatsapp'],
    IndikatorK3: ['id','nama','kategori','satuan','deskripsi','aktif','urutan'],
    StandarK3: ['id','indicatorId','nilaiMinimum','metode','regulasi','keterangan','aktif'],
    DataAktualK3: ['id','companyId','indicatorId','nilaiAktual','updatedAt'],
    HasilPerhitungan: ['id','companyId','indicatorId','aktual','standar','status','kekurangan','tanggal'],
    RiwayatUpdate: ['id','waktu','username','modul','aktivitas']
  },
  sessionSeconds: 21600
};

function doGet(e) {
  setupIfNeeded_();
  if (e && e.parameter && (e.parameter.action === 'public' || e.parameter.format === 'json')) {
    return ContentService.createTextOutput(JSON.stringify(getPublicData()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle(CFG.title)
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);
    const action = data.action;
    let res = { ok: true };

    if (action === 'login') {
      const auth = login(data.username, data.password);
      res = { ok: true, token: auth.token, user: auth.username };
    } else if (action === 'logout') {
      logout(data.token);
      res = { ok: true };
    } else if (action === 'password') {
      changePassword(data.token, data.new);
      res = { ok: true };
    } else if (action === 'save') {
      const sheet = data.sheet;
      const records = data.data;
      if (sheet === 'Profil' || sheet === 'ProfilPerusahaan') {
        const obj = {};
        if (Array.isArray(records)) {
          records.forEach(r => { obj[r.key] = r.value; });
        } else if (records && typeof records === 'object') {
          Object.assign(obj, records);
        }
        saveRecord(data.token, 'ProfilPerusahaan', obj);
      } else if (sheet === 'Struktur' || sheet === 'StrukturOrganisasi') {
        const item = (records && typeof records === 'object' && !Array.isArray(records))
          ? { id: 'STRUKTUR-IMG', nama: 'Bagan Struktur Organisasi', jabatan: 'Gambar Resmi', fotoUrl: records.gambar || records.fotoUrl || '', urutan: 1, aktif: true }
          : records;
        saveRecord(data.token, 'StrukturOrganisasi', item);
      } else {
        if (Array.isArray(records)) {
          records.forEach(item => saveRecord(data.token, sheet, item));
        } else if (records) {
          saveRecord(data.token, sheet, records);
        }
      }
      res = { ok: true };
    } else if (action === 'calculate') {
      const calcResult = calculate(data.token);
      res = { ok: true, ...calcResult };
    } else {
      throw new Error('Aksi tidak dikenal: ' + action);
    }

    return ContentService.createTextOutput(JSON.stringify(res))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Buka Apps Script dari Google Spreadsheet.');
  Object.keys(CFG.sheets).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1,1,1,CFG.sheets[name].length).setValues([CFG.sheets[name]]);
      sh.setFrozenRows(1);
      sh.getRange(1,1,1,CFG.sheets[name].length).setFontWeight('bold').setBackground('#e8f3ed');
    }
  });
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ADMIN_USERNAME')) props.setProperty('ADMIN_USERNAME','admin');
  if (!props.getProperty('ADMIN_PASSWORD_HASH')) props.setProperty('ADMIN_PASSWORD_HASH',hash_('GantiAdminK3!2026'));
  seed_();
  return 'Setup berhasil. Login awal: admin / GantiAdminK3!2026';
}

function setupIfNeeded_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Spreadsheet tidak ditemukan.');
  if (Object.keys(CFG.sheets).some(n => !ss.getSheetByName(n))) setup();
}

function seed_() {
  const profile = rows_('ProfilPerusahaan');
  if (!profile.length) {
    appendObject_('ProfilPerusahaan', {
      id:'PROFILE-1', nama:'Nama Perusahaan Anda', tagline:'Membangun layanan dengan mengutamakan mutu dan keselamatan kerja',
      logoUrl:'', bannerUrl:'', sejarah:'Tuliskan sejarah singkat perusahaan di menu admin.',
      visi:'Tuliskan visi perusahaan.', misi:'Tuliskan misi perusahaan.', sektor:'Bidang usaha',
      tahunBerdiri:'', alamat:'', kota:'', telepon:'', email:'', website:'', jumlahPekerja:0, tingkatBahaya:'Belum diklasifikasikan', potensiBahaya:'', updatedAt:new Date().toISOString()
    });
  }
  if (!rows_('Kontak').length) appendObject_('Kontak',{id:'CONTACT-1',alamat:'',telepon:'',email:'',website:'',mapsUrl:'',instagram:'',facebook:'',whatsapp:''});
  if (!rows_('IndikatorK3').length) {
    const items = [
      ['I01','Jalur evakuasi tersedia','Evaluasi','status'],['I02','Pintu darurat tersedia','Evaluasi','status'],
      ['I03','Titik kumpul tersedia','Evaluasi','status'],['I04','Rambu evakuasi tersedia','Evaluasi','status'],
      ['I05','Jumlah APAR tersedia','Peralatan','unit'],['I06','Hidran tersedia','Peralatan','unit'],
      ['I07','Sprinkler tersedia/berfungsi','Peralatan','unit'],['I08','Alarm kebakaran berfungsi','Peralatan','unit'],
      ['I09','Detektor kebakaran berfungsi','Peralatan','unit'],['I10','Petugas peran kebakaran','Personel','orang'],
      ['I11','Petugas kebakaran terlatih','Personel','orang'],['I12','Ahli K3 spesialis kebakaran','Personel','orang'],
      ['I13','Rencana tanggap darurat tersedia','Prosedur','status'],['I14','Simulasi kebakaran per tahun','Prosedur','kali/tahun'],
      ['I15','Inspeksi APAR per tahun','Prosedur','kali/tahun']
    ];
    items.forEach((x,i)=>appendObject_('IndikatorK3',{id:x[0],nama:x[1],kategori:x[2],satuan:x[3],deskripsi:'',aktif:true,urutan:i+1}));
  }
  if (!rows_('StandarK3').length) {
    rows_('IndikatorK3').forEach(i=>appendObject_('StandarK3',{
      id:Utilities.getUuid(),indicatorId:i.id,nilaiMinimum:0,metode:'min',
      regulasi:'Perlu diverifikasi sesuai regulasi dan kondisi tempat kerja',keterangan:'Nilai awal placeholder; ubah sebelum digunakan.',aktif:true
    }));
  }
}

function login(username,password) {
  const p=PropertiesService.getScriptProperties();
  if (String(username)!==(p.getProperty('ADMIN_USERNAME')||'admin') ||
      hash_(String(password))!==p.getProperty('ADMIN_PASSWORD_HASH')) throw new Error('Username atau password salah.');
  const token=Utilities.getUuid();
  CacheService.getScriptCache().put('sess_'+token,JSON.stringify({username:String(username),role:'admin'}),CFG.sessionSeconds);
  return {token,username:String(username)};
}
function logout(token){if(token)CacheService.getScriptCache().remove('sess_'+token);return true;}
function changePassword(token,newPassword){
  const s=requireAdmin_(token); if(String(newPassword).length<10)throw new Error('Password minimal 10 karakter.');
  PropertiesService.getScriptProperties().setProperty('ADMIN_PASSWORD_HASH',hash_(String(newPassword)));
  log_(s.username,'Akun','Mengganti password admin'); return true;
}

function getPublicData() {
  const profile=rows_('ProfilPerusahaan')[0]||{};
  const contacts=rows_('Kontak')[0]||{};
  const indicators=rows_('IndikatorK3').filter(x=>truth_(x.aktif)).sort((a,b)=>Number(a.urutan)-Number(b.urutan));
  const results=rows_('HasilPerhitungan');
  const services=rows_('Layanan').filter(x=>truth_(x.aktif)).sort((a,b)=>Number(a.urutan)-Number(b.urutan));
  const structure=rows_('StrukturOrganisasi').filter(x=>truth_(x.aktif)).sort((a,b)=>Number(a.urutan)-Number(b.urutan));
  const gallery=rows_('Galeri').filter(x=>truth_(x.aktif));
  const companyId='PROFILE-1';
  const current=results.filter(x=>x.companyId===companyId);
  const good=current.filter(x=>x.status==='Memenuhi').length;
  const bad=current.length-good;
  return {
    profile,contacts,services,structure,gallery,indicators,
    results:current,
    summary:{total:current.length,compliant:good,notCompliant:bad,percent:current.length?Math.round(good/current.length*100):0}
  };
}

function getAdminData(token) {
  requireAdmin_(token);
  const out={}; Object.keys(CFG.sheets).forEach(n=>out[n]=rows_(n));
  return out;
}

function saveRecord(token,sheetName,data) {
  const session=requireAdmin_(token);
  const allowed=['ProfilPerusahaan','Layanan','StrukturOrganisasi','Galeri','Kontak','IndikatorK3','StandarK3'];
  if(!allowed.includes(sheetName))throw new Error('Modul tidak diizinkan.');
  if(!data)throw new Error('Data kosong.');
  const id=String(data.id|| (sheetName.toUpperCase()+'-'+Utilities.getUuid().slice(0,8)));
  data.id=id;
  if(sheetName==='ProfilPerusahaan')data.updatedAt=new Date().toISOString();
  upsert_(sheetName,data);
  log_(session.username,sheetName,'Menyimpan data '+id);
  return id;
}

function saveActual(token,indicatorId,value) {
  const session=requireAdmin_(token);
  const sh='DataAktualK3', companyId='PROFILE-1';
  const existing=rows_(sh).find(x=>x.companyId===companyId&&x.indicatorId===indicatorId);
  upsert_(sh,{id:existing?existing.id:Utilities.getUuid(),companyId,indicatorId,nilaiAktual:Number(value||0),updatedAt:new Date().toISOString()});
  log_(session.username,'Data K3','Memperbarui data aktual '+indicatorId);
  return true;
}

function calculate(token) {
  const session=requireAdmin_(token);
  const inds=rows_('IndikatorK3').filter(x=>truth_(x.aktif));
  const standards=rows_('StandarK3').filter(x=>truth_(x.aktif));
  const actuals=rows_('DataAktualK3');
  const output=inds.map(ind=>{
    const st=standards.find(x=>x.indicatorId===ind.id);
    const ac=actuals.find(x=>x.indicatorId===ind.id);
    const actual=Number(ac?ac.nilaiAktual:0), min=Number(st?st.nilaiMinimum:0);
    const status=ind.satuan==='status'?(actual>=1?'Memenuhi':'Tidak Memenuhi'):(st&&st.metode==='exact'?(actual===min?'Memenuhi':'Tidak Memenuhi'):(actual>=min?'Memenuhi':'Tidak Memenuhi'));
    return {id:Utilities.getUuid(),companyId:'PROFILE-1',indicatorId:ind.id,aktual:actual,standar:min,status,kekurangan:Math.max(0,min-actual),tanggal:new Date().toISOString()};
  });
  const sh=sheet_('HasilPerhitungan'); sh.clearContents();
  const headers=CFG.sheets.HasilPerhitungan; sh.getRange(1,1,1,headers.length).setValues([headers]);
  if(output.length)sh.getRange(2,1,output.length,headers.length).setValues(output.map(o=>headers.map(h=>o[h]??'')));
  log_(session.username,'Perhitungan K3','Menjalankan perhitungan kepatuhan');
  return {results:output};
}

function deleteRecord(token,sheetName,id) {
  const s=requireAdmin_(token);
  const allowed=['Layanan','StrukturOrganisasi','Galeri','IndikatorK3','StandarK3'];
  if(!allowed.includes(sheetName))throw new Error('Penghapusan tidak diizinkan untuk modul ini.');
  const sh=sheet_(sheetName),v=sh.getDataRange().getValues(),col=v[0].indexOf('id');
  for(let i=v.length-1;i>=1;i--)if(String(v[i][col])===String(id))sh.deleteRow(i+1);
  log_(s.username,sheetName,'Menghapus data '+id);return true;
}

function requireAdmin_(token) {
  const raw=token&&CacheService.getScriptCache().get('sess_'+token);
  if(!raw)throw new Error('Sesi berakhir. Silakan login kembali.');
  const s=JSON.parse(raw);if(s.role!=='admin')throw new Error('Akses ditolak.');return s;
}
function sheet_(n){const s=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(n);if(!s)throw new Error('Sheet '+n+' tidak ditemukan. Jalankan setup().');return s;}
function rows_(n){const v=sheet_(n).getDataRange().getValues();if(v.length<2)return[];const h=v[0].map(String);return v.slice(1).filter(r=>r.some(x=>x!=='')).map(r=>{const o={};h.forEach((k,i)=>o[k]=r[i]);return o;});}
function appendObject_(n,o){const h=CFG.sheets[n];sheet_(n).appendRow(h.map(k=>o[k]===undefined?'':o[k]));}
function upsert_(n,o){const sh=sheet_(n),v=sh.getDataRange().getValues(),h=v[0].map(String),c=h.indexOf('id');let row=-1;for(let i=1;i<v.length;i++)if(String(v[i][c])===String(o.id)){row=i+1;break;}const a=h.map(k=>o[k]===undefined?'':o[k]);if(row>0)sh.getRange(row,1,1,h.length).setValues([a]);else sh.appendRow(a);}
function log_(user,modul,aktivitas){appendObject_('RiwayatUpdate',{id:Utilities.getUuid(),waktu:new Date().toISOString(),username:user,modul,aktivitas});}
function hash_(s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s,Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');}
function truth_(v){return v===true||String(v).toLowerCase()==='true'||String(v)==='1';}
