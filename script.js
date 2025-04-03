// Initialize storage if not exists
if (!localStorage.getItem('letterCounters')) {
    localStorage.setItem('letterCounters', JSON.stringify({
        incoming: 0,
        outgoing: 0
    }));
}

if (!localStorage.getItem('incomingLetters')) {
    localStorage.setItem('incomingLetters', JSON.stringify([]));
}

if (!localStorage.getItem('outgoingLetters')) {
    localStorage.setItem('outgoingLetters', JSON.stringify([]));
}

// Generate letter number
function generateLetterNumber(type) {
    const counters = JSON.parse(localStorage.getItem('letterCounters'));
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    if (type === 'incoming') {
        counters.incoming += 1;
        return `MASAMAS-IN-${year}${month}${day}-${String(counters.incoming).padStart(3, '0')}`;
    } else {
        counters.outgoing += 1;
        return `MASAMAS-OUT-${year}${month}${day}-${String(counters.outgoing).padStart(3, '0')}`;
    }
}

// Toggle between auto/manual numbering
function toggleNumberingMode(type) {
    const numberField = type === 'incoming' ? 
        document.getElementById('incomingNumber') : 
        document.getElementById('outgoingNumber');
    const toggleBtn = type === 'incoming' ?
        document.getElementById('toggleIncomingMode') :
        document.getElementById('toggleOutgoingMode');

    if (numberField.readOnly) {
        // Switch to manual mode
        numberField.readOnly = false;
        numberField.classList.remove('bg-gray-100');
        numberField.classList.add('bg-white');
        toggleBtn.innerHTML = '<i class="fas fa-magic mr-1"></i> Auto';
        toggleBtn.classList.replace('toggle-btn-auto', 'toggle-btn-manual');
    } else {
        // Switch to auto mode
        numberField.readOnly = true;
        numberField.classList.remove('bg-white');
        numberField.classList.add('bg-gray-100');
        numberField.value = generateLetterNumber(type);
        toggleBtn.innerHTML = '<i class="fas fa-edit mr-1"></i> Manual';
        toggleBtn.classList.replace('toggle-btn-manual', 'toggle-btn-auto');
    }
}

// Save letter to storage
function saveLetter(type, data) {
    const storageKey = type === 'incoming' ? 'incomingLetters' : 'outgoingLetters';
    const letters = JSON.parse(localStorage.getItem(storageKey));
    letters.push(data);
    localStorage.setItem(storageKey, JSON.stringify(letters));
    return true;
}

// Load letters from storage
function loadLetters(type) {
    const storageKey = type === 'incoming' ? 'incomingLetters' : 'outgoingLetters';
    return JSON.parse(localStorage.getItem(storageKey));
}

// Display letters in table
function displayLetters(type) {
    const letters = loadLetters(type);
    const tableBody = type === 'incoming' ? 
        document.getElementById('incomingList') : 
        document.getElementById('outgoingList');
    
    tableBody.innerHTML = '';
    
    letters.forEach((letter, index) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        row.innerHTML = `
            <td class="py-3 px-4">${letter.number}</td>
            <td class="py-3 px-4">${letter.date}</td>
            <td class="py-3 px-4">${type === 'incoming' ? letter.sender : letter.recipient}</td>
            <td class="py-3 px-4">${letter.subject}</td>
            <td class="py-3 px-4">
                <button onclick="viewLetter('${type}', ${index})" class="text-blue-600 hover:text-blue-800 mr-2">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="deleteLetter('${type}', ${index})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// View letter details
function viewLetter(type, index) {
    const letters = loadLetters(type);
    const letter = letters[index];
    
    alert(`Detail Surat:\n\nNomor: ${letter.number}\nTanggal: ${letter.date}\n${
        type === 'incoming' ? 'Pengirim' : 'Tujuan'}: ${
        type === 'incoming' ? letter.sender : letter.recipient}\nPerihal: ${letter.subject}\nKeterangan: ${letter.notes || '-'}`);
}

// Delete letter
function deleteLetter(type, index) {
    if (confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
        const storageKey = type === 'incoming' ? 'incomingLetters' : 'outgoingLetters';
        const letters = loadLetters(type);
        letters.splice(index, 1);
        localStorage.setItem(storageKey, JSON.stringify(letters));
        displayLetters(type);
        showNotification('Surat berhasil dihapus');
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize forms
document.addEventListener('DOMContentLoaded', function() {
    // Incoming letter form
    if (document.getElementById('incomingForm')) {
        document.getElementById('incomingNumber').value = generateLetterNumber('incoming');
        document.getElementById('incomingDate').valueAsDate = new Date();
        
        // Add toggle button for numbering mode
        const incomingNumberField = document.getElementById('incomingNumber');
        const incomingToggleBtn = document.createElement('button');
        incomingToggleBtn.id = 'toggleIncomingMode';
        incomingToggleBtn.type = 'button';
        incomingToggleBtn.className = 'ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm';
        incomingToggleBtn.innerHTML = '<i class="fas fa-edit"></i> Manual';
        incomingToggleBtn.onclick = () => toggleNumberingMode('incoming');
        incomingNumberField.parentNode.appendChild(incomingToggleBtn);
        
        document.getElementById('incomingForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const letterData = {
                number: document.getElementById('incomingNumber').value,
                date: document.getElementById('incomingDate').value,
                sender: document.getElementById('incomingSender').value,
                subject: document.getElementById('incomingSubject').value,
                notes: document.getElementById('incomingNotes').value
            };
            
            if (saveLetter('incoming', letterData)) {
                showNotification('Surat masuk berhasil disimpan');
                this.reset();
                document.getElementById('incomingNumber').value = generateLetterNumber('incoming');
                document.getElementById('incomingDate').valueAsDate = new Date();
                displayLetters('incoming');
            }
        });
        
        displayLetters('incoming');
    }
    
    // Outgoing letter form
    if (document.getElementById('outgoingForm')) {
        document.getElementById('outgoingNumber').value = generateLetterNumber('outgoing');
        document.getElementById('outgoingDate').valueAsDate = new Date();
        
        // Add toggle button for numbering mode
        const outgoingNumberField = document.getElementById('outgoingNumber');
        const outgoingToggleBtn = document.createElement('button');
        outgoingToggleBtn.id = 'toggleOutgoingMode';
        outgoingToggleBtn.type = 'button';
        outgoingToggleBtn.className = 'ml-2 px-3 py-1 rounded text-sm toggle-btn toggle-btn-auto';
        outgoingToggleBtn.innerHTML = '<i class="fas fa-edit mr-1"></i> Manual';
        outgoingToggleBtn.onclick = () => toggleNumberingMode('outgoing');
        outgoingNumberField.parentNode.appendChild(outgoingToggleBtn);
        
        document.getElementById('outgoingForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const letterData = {
                number: document.getElementById('outgoingNumber').value,
                date: document.getElementById('outgoingDate').value,
                recipient: document.getElementById('outgoingRecipient').value,
                subject: document.getElementById('outgoingSubject').value,
                notes: document.getElementById('outgoingNotes').value
            };
            
            if (saveLetter('outgoing', letterData)) {
                showNotification('Surat keluar berhasil disimpan');
                this.reset();
                document.getElementById('outgoingNumber').value = generateLetterNumber('outgoing');
                document.getElementById('outgoingDate').valueAsDate = new Date();
                displayLetters('outgoing');
            }
        });
        
        displayLetters('outgoing');
    }
});