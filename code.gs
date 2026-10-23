function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Dashboard Eksekutif Organisasi')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getDashboardData() {
  // ID Spreadsheet Anda (Sudah benar sesuai input sebelumnya)
  var idKeguruan = '1feTjAWGR982FHxcK4GivBkuai_NPC3bMHnvkbE3u0tM'; 
  var idKegiatan = '1Z2Mp0gAoe7q-TnzoQC_vzIaSXrA1Aht0aY2Th4rBC7o'; 
  var idPcm      = '1qwhciloe55ICj8L172JJgNKVWNXBLBql2qECnVluwXo'; 
  
  var res = {
    totalMhs: 0,
    totalKegiatan: 0,
    rataPcm: 0,
    keguruan: [],
    kegiatan: [],
    pcm: []
  };
  
  // 1. Ambil Data Kuliah Keguruan
  try {
    var ss1 = SpreadsheetApp.openById(idKeguruan);
    var sheet1 = ss1.getSheets()[0];
    var data1 = sheet1.getDataRange().getValues();
    if (data1.length > 1) {
      res.totalMhs = data1.length - 1;
      // Ambil maksimal 5 baris data (melewati header)
      for (var i = 1; i < Math.min(data1.length, 6); i++) {
        res.keguruan.push({
          no: data1[i][0] || '-',
          nama: data1[i][1] || '-',
          prodi: data1[i][3] || '-',
          angkatan: data1[i][4] || '-'
        });
      }
    }
  } catch(e) { Logger.log('Error Keguruan: ' + e.message); }
  
  // 2. Ambil Data IE dan ISOSK
  try {
    var ss2 = SpreadsheetApp.openById(idKegiatan);
    var sheet2 = ss2.getSheets()[0];
    var data2 = sheet2.getDataRange().getValues();
    if (data2.length > 1) {
      res.totalKegiatan = data2.length - 1;
      for (var i = 1; i < Math.min(data2.length, 6); i++) {
        res.kegiatan.push({
          nama: data2[i][1] || '-',
          kegiatan: data2[i][4] || '-',
          institusi: data2[i][5] || '-',
          kota: data2[i][6] || '-',
          kecamatan: data2[i][7] || '-'
        });
      }
    }
  } catch(e) { Logger.log('Error Kegiatan: ' + e.message); }
  
  // 3. Ambil Data PCM
  try {
    var ss3 = SpreadsheetApp.openById(idPcm);
    var sheet3 = ss3.getSheets()[0];
    var data3 = sheet3.getDataRange().getValues();
    if (data3.length > 1) {
      var totalPcm = 0;
      var countPcm = 0;
      for (var i = 1; i < data3.length; i++) {
        var nilai = parseFloat(data3[i][5]); // Kolom F
        if (!isNaN(nilai)) {
          totalPcm += nilai;
          countPcm++;
        }
        
        // Simpan ke list data ringkasan (hanya sampai indeks ke-5)
        if (i < 6) {
          res.pcm.push({
            nama: data3[i][1] || '-',
            prodi: data3[i][3] || '-',
            angkatan: data3[i][4] || '-',
            nilai: data3[i][5] !== undefined ? data3[i][5] : '-'
          });
        }
      }
      res.rataPcm = countPcm > 0 ? (totalPcm / countPcm).toFixed(2) : 0;
    }
  } catch(e) { Logger.log('Error PCM: ' + e.message); }
  
  // Ubah menjadi format teks JSON agar tidak mengalami gangguan serialisasi array di Apps Script
  return JSON.stringify(res);
}
