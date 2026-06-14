const input = document.getElementById('imageInput');
const preview = document.getElementById('preview');
let selectedFiles = []; // เก็บรูปที่เลือก

function updatePreview() {
  preview.innerHTML = '';
  selectedFiles.forEach((file, index) => {
    const container = document.createElement('div');
    container.className = 'relative group';

    const img = document.createElement('img');
    img.className = 'w-full h-24 object-cover rounded-lg border';
    img.src = URL.createObjectURL(file);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-base opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition shadow-lg';
    deleteBtn.innerHTML = '✕';
    deleteBtn.onclick = (e) => {
      e.preventDefault();
      removeImage(index);
    };

    container.appendChild(img);
    container.appendChild(deleteBtn);
    preview.appendChild(container);
  });
}

function removeImage(index) {
  selectedFiles.splice(index, 1);
  updatePreview();
}

input.addEventListener('change', () => {
  selectedFiles = [...selectedFiles, ...input.files];
  input.value = '';
  updatePreview();
});

async function convertToPDF(download) {
  if (!selectedFiles.length) {
    alert('กรุณาเลือกรูปก่อน');
    return;
  }

  const loading = document.getElementById('loading');
  loading.classList.remove('hidden');

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');

  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    const imgData = await fileToBase64(file);
    const img = new Image();
    img.src = imgData;

    await new Promise(resolve => img.onload = resolve);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const scale = Math.min(pageWidth / img.width, pageHeight / img.height);
    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    if (i > 0) pdf.addPage();
    pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
  }

  if (download) {
    pdf.save('images.pdf');
  } else {
    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl, '_blank');
  }

  loading.classList.add('hidden');
}

async function convertToPDFSmall(download) {
  if (!selectedFiles.length) {
    alert('กรุณาเลือกรูปก่อน');
    return;
  }

  const loading = document.getElementById('loading');
  loading.classList.remove('hidden');

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF('p', 'mm', 'a4');

  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    const imgData = await fileToBase64(file);
    const img = new Image();
    img.src = imgData;

    await new Promise(resolve => img.onload = resolve);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const maxWidth = pageWidth * 0.7;
    const maxHeight = pageHeight * 0.7;

    let imgWidth = maxWidth;
    let imgHeight = (img.height * imgWidth) / img.width;

    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      imgWidth = (img.width * imgHeight) / img.height;
    }

    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    if (i > 0) pdf.addPage();
    pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
  }

  if (download) {
    pdf.save('images-small.pdf');
  } else {
    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl, '_blank');
  }

  loading.classList.add('hidden');
}

async function convertToIDCard(download) {
  if (!selectedFiles.length) {
    alert('กรุณาเลือกรูปก่อน');
    return;
  }

  const loading = document.getElementById('loading');
  loading.classList.remove('hidden');

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const cardWidth = 85.6;
  const cardHeight = 53.98;
  const marginTop = 40;
  const cardX = (pageWidth - cardWidth) / 2;
  const cardY = marginTop;

  for (let i = 0; i < selectedFiles.length; i++) {
    if (i > 0) pdf.addPage();

    const file = selectedFiles[i];
    const imgData = await fileToBase64(file);
    const img = new Image();
    img.src = imgData;

    await new Promise(resolve => img.onload = resolve);

    pdf.setFillColor(255, 255, 255);
    pdf.rect(cardX, cardY, cardWidth, cardHeight, 'F');
    pdf.setDrawColor(120);
    pdf.setLineWidth(0.3);

    const scale = Math.min(cardWidth / img.width, cardHeight / img.height);
    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;
    const imgX = cardX + (cardWidth - imgWidth) / 2;
    const imgY = cardY + (cardHeight - imgHeight) / 2;

    pdf.addImage(img, 'JPEG', imgX, imgY, imgWidth, imgHeight);
  }

  if (download) {
    pdf.save('id-card-a4.pdf');
  } else {
    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl, '_blank');
  }

  loading.classList.add('hidden');
}

async function convertToIDCardFrontBack(download) {
  if (!selectedFiles.length) {
    alert('กรุณาเลือกรูปก่อน');
    return;
  }
  if (selectedFiles.length < 2) {
    alert('สำหรับบัตรประชาชนหน้า-หลัง ต้องเลือก 2 รูป เรียงตามลำดับด้านหน้า-ด้านหลัง');
    return;
  }

  const loading = document.getElementById('loading');
  loading.classList.remove('hidden');

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const cardWidth = 85.6;
  const cardHeight = 53.98;
  const gutter = 80;
  const startY = 30;
  const cardX = (pageWidth - cardWidth) / 2;

  const images = await Promise.all([selectedFiles[0], selectedFiles[1]].map(async file => {
    const imgData = await fileToBase64(file);
    const img = new Image();
    img.src = imgData;
    await new Promise(resolve => img.onload = resolve);
    return img;
  }));

  images.forEach((img, index) => {
    const cardY = startY + index * (cardHeight + gutter);

    pdf.setFillColor(255, 255, 255);
    pdf.rect(cardX, cardY, cardWidth, cardHeight, 'F');
    pdf.setDrawColor(120);
    pdf.setLineWidth(0.3);

    const scale = Math.min(cardWidth / img.width, cardHeight / img.height);
    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;
    const imgX = cardX + (cardWidth - imgWidth) / 2;
    const imgY = cardY + (cardHeight - imgHeight) / 2;

    pdf.addImage(img, 'JPEG', imgX, imgY, imgWidth, imgHeight);
  });

  if (download) {
    pdf.save('id-card-front-back-a4.pdf');
  } else {
    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl, '_blank');
  }

  loading.classList.add('hidden');
}

async function convertToHouseCopy(download) {
  if (!selectedFiles.length) {
    alert('กรุณาเลือกรูปก่อน');
    return;
  }
  if (selectedFiles.length < 2) {
    alert('สำหรับสำเนาทะเบียนบ้าน ต้องเลือก 2 รูป เรียงตามลำดับบน-ล่าง');
    return;
  }

  const loading = document.getElementById('loading');
  loading.classList.remove('hidden');

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 6;
  const gutter = 30;
  const cardWidth = 170;
  const cardHeight = 120;
  const cardX = (pageWidth - cardWidth) / 2;

  const images = await Promise.all([selectedFiles[0], selectedFiles[1]].map(async file => {
    const imgData = await fileToBase64(file);
    const img = new Image();
    img.src = imgData;
    await new Promise(resolve => img.onload = resolve);
    return img;
  }));

  images.forEach((img, index) => {
    const y = margin + index * (cardHeight + gutter);
    const scale = Math.min(cardWidth / img.width, cardHeight / img.height);
    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;
    const imgX = cardX + (cardWidth - imgWidth) / 2;
    const imgY = y + (cardHeight - imgHeight) / 2;

    pdf.addImage(img, 'JPEG', imgX, imgY, imgWidth, imgHeight);
  });

  if (download) {
    pdf.save('house-registration-copy.pdf');
  } else {
    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl, '_blank');
  }

  loading.classList.add('hidden');
}

async function convertToA4Grid(download) {
  if (!selectedFiles.length) {
    alert('กรุณาเลือกรูปก่อน');
    return;
  }

  const loading = document.getElementById('loading');
  loading.classList.remove('hidden');

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const gutter = 6;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const images = await Promise.all(selectedFiles.map(async file => {
    const imgData = await fileToBase64(file);
    const img = new Image();
    img.src = imgData;
    await new Promise(resolve => img.onload = resolve);
    return img;
  }));

  const maxPerPage = 9;
  const pages = Math.ceil(images.length / maxPerPage);

  for (let pageIndex = 0; pageIndex < pages; pageIndex++) {
    if (pageIndex > 0) pdf.addPage();
    const pageImages = images.slice(pageIndex * maxPerPage, pageIndex * maxPerPage + maxPerPage);
    const count = pageImages.length;
    let cols, rows;

    if (count === 1) {
      cols = 1;
      rows = 1;
    } else if (count === 2) {
      cols = 1;
      rows = 2;
    } else if (count === 3) {
      cols = 2;
      rows = 2;
    } else if (count === 4) {
      cols = 2;
      rows = 2;
    } else if (count <= 6) {
      cols = 3;
      rows = 2;
    } else {
      cols = 3;
      rows = 3;
    }

    const cellWidth = (usableWidth - gutter * (cols - 1)) / cols;
    const cellHeight = (usableHeight - gutter * (rows - 1)) / rows;

    pageImages.forEach((img, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = margin + col * (cellWidth + gutter);
      const y = margin + row * (cellHeight + gutter);
      const scale = Math.min(cellWidth / img.width, cellHeight / img.height);
      const imgWidth = img.width * scale;
      const imgHeight = img.height * scale;
      const imgX = x + (cellWidth - imgWidth) / 2;
      const imgY = y + (cellHeight - imgHeight) / 2;

      pdf.setDrawColor(180);
      pdf.setLineWidth(0.2);
      pdf.rect(x, y, cellWidth, cellHeight, 'S');
      pdf.addImage(img, 'JPEG', imgX, imgY, imgWidth, imgHeight);
    });
  }

  if (download) {
    pdf.save('images-a4-grid.pdf');
  } else {
    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl, '_blank');
  }

  loading.classList.add('hidden');
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

async function convertToPassbook(download) {
  if (!selectedFiles.length) {
    alert('กรุณาเลือกรูปก่อน');
    return;
  }

  const loading = document.getElementById('loading');
  loading.classList.remove('hidden');

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const passbookWidth = 80; // ความกว้างรูปสมุดบัญชี หน่วยมิลลิเมตร
  const passbookHeight = 120; // ความสูงรูปสมุดบัญชี หน่วยมิลลิเมตร
  const offsetX = 0; // ขยับซ้าย/ขวา: ค่าบวกไปขวา, ค่าลบไปซ้าย
  const offsetY = -60; // ขยับขึ้น/ลง: ค่าบวกลงล่าง, ค่าลบขึ้นบน

  const images = await Promise.all(selectedFiles.map(async file => {
    const imgData = await fileToBase64(file);
    const img = new Image();
    img.src = imgData;
    await new Promise(resolve => img.onload = resolve);
    return img;
  }));

  images.forEach((img, index) => {
    if (index > 0) pdf.addPage();

    const scale = Math.min(passbookWidth / img.width, passbookHeight / img.height);
    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;
    const imgX = (pageWidth - imgWidth) / 2 + offsetX;
    const imgY = (pageHeight - imgHeight) / 2 + offsetY;

    pdf.addImage(img, 'JPEG', imgX, imgY, imgWidth, imgHeight);
  });

  if (download) {
    pdf.save('passbook.pdf');
  } else {
    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl, '_blank');
  }

  loading.classList.add('hidden');
}
