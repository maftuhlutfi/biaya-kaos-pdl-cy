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

    document.getElementById('sizeKaos').textContent = peserta['Size Kaos'];
    document.getElementById('lenganKaos').textContent = peserta['Lengan Kaos'];
    document.getElementById('biayaKaos').textContent = peserta['Biaya Kaos'];

    document.getElementById('sizePdl').textContent = peserta['Size PDL'];
    document.getElementById('lenganPdl').textContent = peserta['Lengan PDL'];
    document.getElementById('biayaPdl').textContent = peserta['Biaya PDL'];

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
