function doGet() {
  return ContentService.createTextOutput(getDashboardData())
    .setMimeType(ContentService.MimeType.JSON);
}

function getDashboardData() {
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
    var data1 = SpreadsheetApp.openById(idKeguruan).getSheets()[0].getDataRange().getValues();
    if (data1.length > 1) {
      res.totalMhs = data1.length - 1;
      for (var i = 1; i < Math.min(data1.length, 6); i++) {
        res.keguruan.push({ 
          no: data1[i][0], 
          nama: data1[i][1], 
          prodi: data1[i][3], 
          angkatan: data1[i][4] 
        });
      }
    }
  } catch(e) { Logger.log("Mhs: " + e.message); }
  
  // 2. Ambil Data IE dan ISOSK
  try {
    var data2 = SpreadsheetApp.openById(idKegiatan).getSheets()[0].getDataRange().getValues();
    if (data2.length > 1) {
      res.totalKegiatan = data2.length - 1;
      for (var i = 1; i < Math.min(data2.length, 6); i++) {
        res.kegiatan.push({ 
          nama: data2[i][1], 
          kegiatan: data2[i][4], 
          institusi: data2[i][5], 
          kecamatan: data2[i][7], 
          kota: data2[i][6] 
        });
      }
    }
  } catch(e) { Logger.log("Keg: " + e.message); }
  
  // 3. Ambil Data PCM
  try {
    var data3 = SpreadsheetApp.openById(idPcm).getSheets()[0].getDataRange().getValues();
    if (data3.length > 1) {
      var totalPcm = 0, countPcm = 0;
      for (var i = 1; i < data3.length; i++) {
        var nilai = parseFloat(data3[i][5]); // Kolom ke-6 (Nilai PCM)
        if (!isNaN(nilai)) { totalPcm += nilai; countPcm++; }
        if (i < 6) {
          res.pcm.push({ 
            nama: data3[i][1], 
            prodi: data3[i][3], 
            angkatan: data3[i][4], 
            nilai: !isNaN(nilai) ? nilai : 0 
          });
        }
      }
      res.rataPcm = countPcm > 0 ? (totalPcm / countPcm).toFixed(2) : 0;
    }
  } catch(e) { Logger.log("PCM: " + e.message); }
  
  return JSON.stringify(res);
}
