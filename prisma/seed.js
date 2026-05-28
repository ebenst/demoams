const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Memulai Seeding Database Hacienda PostgreSQL ---');

  // 1. Membersihkan Database
  await prisma.audit.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✔ Menghapus data lama di database.');

  // 2. Membuat Data Kredensial User Default (Bcrypt)
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const operatorPasswordHash = await bcrypt.hash('operator123', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Rian Hidayat (Admin)',
      email: 'admin@demo.com',
      password: adminPasswordHash,
      role: 'admin',
      status: 'Aktif'
    }
  });

  const operator = await prisma.user.create({
    data: {
      name: 'Siti Aminah (Operator)',
      email: 'operator@demo.com',
      password: operatorPasswordHash,
      role: 'operator',
      status: 'Aktif'
    }
  });

  console.log('✔ Membuat Akun Pengguna (Admin & Operator).');

  // 3. Membuat Kategori Default
  const elektronik = await prisma.category.create({
    data: { name: 'Elektronik', description: 'Perangkat elektronik kantor dan pendukung operasional' }
  });

  const furnitur = await prisma.category.create({
    data: { name: 'Furnitur', description: 'Perabotan dan mebel ruang rapat maupun kerja' }
  });

  const kendaraan = await prisma.category.create({
    data: { name: 'Kendaraan', description: 'Kendaraan dinas dan operasional perusahaan' }
  });

  console.log('✔ Membuat Kategori Aset Kantor.');

  // 4. Generate 150 Asset Terstruktur Kustom (Prisma Bulk Insert)
  const assetsDict = {
    'Elektronik': [
      { name: 'Macbook Pro M3 Max 16"', basePrice: 48000000, prefix: 'MBP' },
      { name: 'ThinkPad T14s Gen 4', basePrice: 22500000, prefix: 'THK' },
      { name: 'Monitor LG Ultrawide 34"', basePrice: 7800000, prefix: 'MON' },
      { name: 'iPad Pro 11" M2 Wifi', basePrice: 15400000, prefix: 'IPD' },
      { name: 'Printer Epson L121', basePrice: 1900000, prefix: 'EPS' }
    ],
    'Furnitur': [
      { name: 'Kursi Ergonomis Steelcase Gesture', basePrice: 14500000, prefix: 'CH-SC' },
      { name: 'Meja Direksi Kayu Jati', basePrice: 18500000, prefix: 'DSK-JT' },
      { name: 'Sofa Resepsionis 3 Seater', basePrice: 8500000, prefix: 'SOF-3S' }
    ],
    'Kendaraan': [
      { name: 'Toyota Kijang Innova Zenix Hybrid', basePrice: 470000000, prefix: 'B-ZEX' },
      { name: 'Yamaha NMAX 155 Connected', basePrice: 35500000, prefix: 'B-NMX' },
      { name: 'Honda PCX 160 ABS', basePrice: 37500000, prefix: 'B-PCX' }
    ]
  };

  const categoriesList = ['Elektronik', 'Furnitur', 'Kendaraan'];
  const createdAssets = [];

  for (let i = 1; i <= 150; i++) {
    const categoryName = categoriesList[(i - 1) % categoriesList.length];
    const templates = assetsDict[categoryName];
    const template = templates[(i - 1) % templates.length];
    const unitNo = Math.ceil(i / (categoriesList.length * templates.length));
    
    const assetId = "AST-" + String(i).padStart(3, '0');
    const finalPrice = Math.round(template.basePrice * (1 + (((i % 11) - 5) / 100)));
    const serialNumber = template.prefix + "-" + (25000 + i);
    const purchaseDate = new Date("2025-" + String((i % 12) + 1).padStart(2, '0') + "-" + String((i % 28) + 1).padStart(2, '0'));
    const nextMaintenance = new Date(purchaseDate);
    nextMaintenance.setMonth(nextMaintenance.getMonth() + 6);

    const asset = await prisma.asset.create({
      data: {
        id: assetId,
        name: template.name + " (Unit " + unitNo + ")",
        categoryName: categoryName,
        status: i % 12 === 0 ? 'Maintenance' : 'Active',
        serial: serialNumber,
        purchaseDate: purchaseDate,
        price: finalPrice,
        description: "Lokasi: Lantai " + (1 + (i % 4)) + ", Ruangan " + (100 + (i % 8)) + ".",
        nextMaintenance: nextMaintenance
      }
    });
    createdAssets.push(asset);
  }

  console.log("✔ Berhasil menginjeksi " + createdAssets.length + " aset (AST-001 s.d AST-150).");

  // 5. Menyisipkan Log Audit Percobaan
  await prisma.audit.create({
    data: {
      assetId: 'AST-001',
      condition: 'Baik',
      pic: 'Budi Santoso',
      photoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400',
      userId: admin.id
    }
  });

  console.log('✔ Menambahkan log audit pertama.');
  console.log('🎉 --- Proses Seeding Database Berhasil Dilakukan ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });