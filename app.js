// GANTI DENGAN URL CSV GOOGLE SHEETS ANDA (Langkah publikasi ada di bawah)
const SPREADSHEET_CSV_URL = 'https://google.com';

// Konfigurasi awal Chart.js agar bertema gelap
Chart.defaults.color = '#9ca3af';
Chart.defaults.borderColor = '#374151';

let trendChart, pieChart;

async function fetchDashboardData() {
    try {
        const response = await fetch(SPREADSHEET_CSV_URL);
        const csvText = await response.text();
        const data = parseCSV(csvText);

        // Perbarui UI Dashboard
        updateKPI(data);
        renderCharts(data);
        
        document.getElementById('last-updated').innerText = `Diperbarui otomatis: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
        console.error('Gagal mengambil data Spreadsheet:', error);
        document.getElementById('last-updated').innerText = 'Gagal memuat data terbaru';
    }
}

// Fungsi sederhana mengubah teks CSV menjadi Array of Objects
function parseCSV(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index] ? values[index].trim() : '';
        });
        return obj;
    });
}

function updateKPI(data) {
    // Asumsi kolom di spreadsheet Anda bernama: 'Pendapatan', 'Transaksi', 'Target'
    let totalRevenue = 0;
    let totalSales = 0;
    let targetPct = 0;

    data.forEach(row => {
        totalRevenue += parseFloat(row.Pendapatan || 0);
        totalSales += parseInt(row.Transaksi || 0);
        targetPct = parseFloat(row.Target || 0); // Ambil data baris terakhir untuk target
    });

    // Format mata uang Rupiah
    document.getElementById('kpi-revenue').innerText = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalRevenue);
    document.getElementById('kpi-sales').innerText = new Intl.NumberFormat('id-ID').format(totalSales);
    document.getElementById('kpi-target').innerText = `${targetPct}%`;
}

function renderCharts(data) {
    // 1. Ekstrak data untuk Grafik Batang (Tren Bulanan)
    // Asumsi kolom spreadsheet: 'Bulan', 'Pendapatan'
    const months = data.map(row => row.Bulan);
    const revenues = data.map(row => parseFloat(row.Pendapatan || 0));

    if (trendChart) trendChart.destroy();
    const ctxTrend = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(ctxTrend, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Pendapatan',
                data: revenues,
                backgroundColor: '#3b82f6',
                borderRadius: 6
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 2. Ekstrak data untuk Grafik Lingkaran (Kategori Produk)
    // Asumsi kolom spreadsheet: 'Kategori', 'Transaksi'
    const categories = data.map(row => row.Kategori).filter(Boolean);
    const salesPerCategory = data.map(row => parseInt(row.Transaksi || 0));

    if (pieChart) pieChart.destroy();
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: salesPerCategory,
                backgroundColor: ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#14b8a6']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Jalankan fungsi saat halaman selesai dimuat
window.addEventListener('DOMContentLoaded', fetchDashboardData);
