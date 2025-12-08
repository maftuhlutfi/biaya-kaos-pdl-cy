// API URL
const API_URL = 'https://api.sheetapi.rest/api/v1/sheets/ilo23bjr49lk4nad8zzyb1d1';

// Global data storage
let pesertaData = [];

// DOM Elements
const namaInput = document.getElementById('namaInput');
const namaDropdown = document.getElementById('namaDropdown');
const detailBox = document.getElementById('detailBox');
const loadingDiv = document.getElementById('loading');

// Selected index
let selectedIndex = -1;

// Fetch data from API
async function fetchData() {
    try {
        loadingDiv.style.display = 'block';
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Gagal mengambil data dari API');
        }

        pesertaData = await response.json();
        populateDropdown();
        loadingDiv.style.display = 'none';
    } catch (error) {
        console.error('Error:', error);
        loadingDiv.innerHTML = '❌ Gagal memuat data. Silakan coba lagi.';
        loadingDiv.style.color = '#ff6b6b';
    }
}

// Populate dropdown with names
function populateDropdown() {
    // Sort by name
    pesertaData.sort((a, b) => {
        const nameA = a['Nama Lengkap'].toLowerCase();
        const nameB = b['Nama Lengkap'].toLowerCase();
        return nameA.localeCompare(nameB);
    });
}

// Filter and display dropdown options
function filterDropdown(searchTerm) {
    const filtered = pesertaData.filter(peserta =>
        peserta['Nama Lengkap'].toLowerCase().includes(searchTerm.toLowerCase())
    );

    namaDropdown.innerHTML = '';

    if (filtered.length === 0) {
        namaDropdown.innerHTML = '<div class="no-results">Tidak ada hasil ditemukan</div>';
        namaDropdown.classList.add('show');
        return;
    }

    filtered.forEach((peserta) => {
        const option = document.createElement('div');
        option.className = 'nama-option';
        option.textContent = peserta['Nama Lengkap'];
        const originalIndex = pesertaData.indexOf(peserta);

        option.addEventListener('click', () => {
            selectOption(peserta['Nama Lengkap'], originalIndex);
        });

        namaDropdown.appendChild(option);
    });

    namaDropdown.classList.add('show');
}

// Select option
function selectOption(nama, index) {
    namaInput.value = nama;
    selectedIndex = index;
    namaDropdown.classList.remove('show');
    displayDetail(index);
}

// Calculate price based on size and sleeve
function calculatePrice(basePrice, size, lengan) {
    let price = basePrice;

    // Add for long sleeve (+10rb)
    if (lengan && lengan.toLowerCase() === 'panjang') {
        price += 10000;
    }

    // Add for size > XL
    const sizeUpper = size ? size.toUpperCase() : '';
    const xCount = (sizeUpper.match(/X/g) || []).length;

    if (xCount > 1) {
        // XXL = 2X = +5rb, XXXL = 3X = +10rb, etc.
        price += (xCount - 1) * 5000;
    }

    return price;
}

// Format number to Rupiah
function formatRupiah(number) {
    return 'Rp' + number.toLocaleString('id-ID');
}

// Display detail when name is selected
function displayDetail(index) {
    if (index === -1 || index === '') {
        detailBox.style.display = 'none';
        return;
    }

    const peserta = pesertaData[index];

    // Populate detail fields
    document.getElementById('namaLengkap').textContent = peserta['Nama Lengkap'];
    document.getElementById('namaPanggilan').textContent = peserta['Nama Panggilan (Untuk PDL)'];
    document.getElementById('status').textContent = peserta['Status'];
    document.getElementById('rt').textContent = peserta['RT'];

    // Calculate and display Kaos price
    const baseKaosPrice = 65000; // Base price for short sleeve
    const sizeKaos = peserta['Size Kaos'];
    const lenganKaos = peserta['Lengan Kaos'];
    const calculatedKaosPrice = calculatePrice(baseKaosPrice, sizeKaos, lenganKaos);

    document.getElementById('sizeKaos').textContent = sizeKaos;
    document.getElementById('lenganKaos').textContent = lenganKaos;

    // Create detailed breakdown for Kaos
    let kaosBreakdown = `${formatRupiah(calculatedKaosPrice)}`;
    let kaosDetails = [];

    if (lenganKaos && lenganKaos.toLowerCase() === 'panjang') {
        kaosDetails.push('Lengan panjang +10rb');
    }

    const kaosXCount = (sizeKaos.toUpperCase().match(/X/g) || []).length;
    if (kaosXCount > 1) {
        kaosDetails.push(`Size ${sizeKaos} +${(kaosXCount - 1) * 5}rb`);
    }

    if (kaosDetails.length > 0) {
        kaosBreakdown += ` (${kaosDetails.join(', ')})`;
    }

    document.getElementById('biayaKaos').textContent = kaosBreakdown;

    // Calculate and display PDL price
    const basePdlPrice = 130000; // Base price for short sleeve
    const sizePdl = peserta['Size PDL'];
    const lenganPdl = peserta['Lengan PDL'];
    const calculatedPdlPrice = calculatePrice(basePdlPrice, sizePdl, lenganPdl);

    document.getElementById('sizePdl').textContent = sizePdl;
    document.getElementById('lenganPdl').textContent = lenganPdl;

    // Create detailed breakdown for PDL
    let pdlBreakdown = `${formatRupiah(calculatedPdlPrice)}`;
    let pdlDetails = [];

    if (lenganPdl && lenganPdl.toLowerCase() === 'panjang') {
        pdlDetails.push('Lengan panjang +10rb');
    }

    const pdlXCount = (sizePdl.toUpperCase().match(/X/g) || []).length;
    if (pdlXCount > 1) {
        pdlDetails.push(`Size ${sizePdl} +${(pdlXCount - 1) * 5}rb`);
    }

    if (pdlDetails.length > 0) {
        pdlBreakdown += ` (${pdlDetails.join(', ')})`;
    }

    document.getElementById('biayaPdl').textContent = pdlBreakdown;

    document.getElementById('biayaAwal').textContent = peserta['Biaya Awal'];
    document.getElementById('subsidi').textContent = peserta['Subsidi'];
    document.getElementById('biayaSetelahSubsidi').textContent = peserta['Biaya Setelah Subsidi'];

    // Format pembayaran DP
    const dpStatus = peserta['Pembayaran DP'] === 'TRUE' ? '✅ Sudah' : '❌ Belum';
    document.getElementById('dp').textContent = dpStatus;

    document.getElementById('kekurangan').textContent = peserta['Kekurangan Setelah DP'];

    // Format status lunas
    const lunasStatus = peserta['LUNAS'] === 'TRUE' ? '✅ LUNAS' : '⏳ Belum Lunas';
    const lunasElement = document.getElementById('lunas');
    lunasElement.textContent = lunasStatus;
    lunasElement.style.color = peserta['LUNAS'] === 'TRUE' ? '#51cf66' : '#ff6b6b';
    lunasElement.style.fontWeight = '700';

    // Show detail box with animation
    detailBox.style.display = 'block';
    detailBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Event listeners
namaInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();

    if (searchTerm.length === 0) {
        namaDropdown.classList.remove('show');
        detailBox.style.display = 'none';
        selectedIndex = -1;
        return;
    }

    filterDropdown(searchTerm);
});

namaInput.addEventListener('focus', (e) => {
    if (e.target.value.trim().length > 0) {
        filterDropdown(e.target.value.trim());
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.form-group')) {
        namaDropdown.classList.remove('show');
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});
