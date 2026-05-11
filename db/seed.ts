import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const client = postgres(process.env['DATABASE_URL']!, { max: 1 })
const db = drizzle(client, { schema })

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function sku(prefix: string, size: string): string {
  return `KLR-${prefix}-${size}`
}

function variants(
  productId: string,
  prefix: string,
  sizes: string[],
  stockBySize: Record<string, number>,
  basePrice?: number,
): schema.NewProductVariant[] {
  return sizes.map((size, i) => ({
    productId,
    size,
    sku: sku(prefix, size),
    stock: stockBySize[size] ?? 0,
    priceOverrideCents: basePrice,
    position: i,
  }))
}

// ─── SEED ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🔪 KILLERCLO — seeding database...')

  // ── Categories ─────────────────────────────────────────────────────────────
  console.log('  → categories')

  const [catJackets, catHoodies, catTees, catPants, catAccessories, catCaps] =
    await db
      .insert(schema.categories)
      .values([
        {
          slug: 'jackets',
          name: 'JACKETS',
          tagline: 'STREET ARMOR',
          position: 0,
          isActive: true,
        },
        {
          slug: 'hoodies',
          name: 'HOODIES',
          tagline: 'BUILT TO KILL',
          position: 1,
          isActive: true,
        },
        {
          slug: 'tees',
          name: 'TEES',
          tagline: 'MARK YOUR TARGET',
          position: 2,
          isActive: true,
        },
        {
          slug: 'pants',
          name: 'PANTS',
          tagline: 'GROUND CONTROL',
          position: 3,
          isActive: true,
        },
        {
          slug: 'accessories',
          name: 'ACCESORIOS',
          tagline: 'COMPLETE THE KIT',
          position: 4,
          isActive: true,
        },
        {
          slug: 'caps',
          name: 'GORRAS',
          tagline: 'HEAD FIRST',
          position: 5,
          isActive: true,
        },
      ])
      .returning()

  if (
    !catJackets || !catHoodies || !catTees ||
    !catPants || !catAccessories || !catCaps
  ) {
    throw new Error('Category insert failed')
  }

  // ── Drop 001 ───────────────────────────────────────────────────────────────
  console.log('  → drops')

  const [drop001] = await db
    .insert(schema.drops)
    .values({
      slug: 'drop-001-initiation',
      name: 'DROP 001 — INITIATION',
      description:
        'El comienzo. La primera entrega del Killer Club. Piezas construidas para durar más que el sistema. Stock limitado, sin reposición.',
      releaseAt: new Date('2026-01-15T12:00:00+01:00'),
      isActive: true,
      position: 0,
    })
    .returning()

  if (!drop001) throw new Error('Drop insert failed')

  // ── Products ───────────────────────────────────────────────────────────────
  console.log('  → products (20)')

  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const coreStock = { XS: 8, S: 15, M: 20, L: 18, XL: 12, XXL: 6 }
  const limitedStock = { XS: 3, S: 5, M: 8, L: 6, XL: 4, XXL: 2 }
  const soldOutStock = { XS: 0, S: 0, M: 2, L: 0, XL: 0, XXL: 0 }

  // HOODIES (4)
  const [hBloodWash] = await db
    .insert(schema.products)
    .values({
      slug: 'hoodie-blood-wash',
      name: 'HOODIE — BLOOD WASH',
      description:
        'Lavado ácido en rojo sangre sobre base negra. 380gsm algodón ring-spun. Corte oversized con capucha doble. La pieza central del Drop 001.',
      basePriceCents: 8900,
      categoryId: catHoodies.id,
      dropId: drop001.id,
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      modelInfo: 'El modelo mide 185 cm y lleva talla M.',
      composition: '100% algodón ring-spun 380gsm. Lavado ácido artesanal.',
      careInstructions: 'Lavar al revés 30°C. No usar secadora. Planchar al revés.',
      seoTitle: 'Hoodie Blood Wash | KILLERCLO Drop 001',
      seoDescription:
        'Hoodie oversized lavado ácido rojo sangre. 380gsm ring-spun. Edición limitada Drop 001. Envío España 3-5 días.',
    })
    .returning()

  const [hTacticalBlack] = await db
    .insert(schema.products)
    .values({
      slug: 'hoodie-tactical-black',
      name: 'HOODIE — TACTICAL BLACK',
      description:
        'Negro total. Sin concesiones. 400gsm French Terry con cordones planos y bolsillo doble. El uniforme del Killer Club.',
      basePriceCents: 9500,
      categoryId: catHoodies.id,
      isActive: true,
      isFeatured: true,
      modelInfo: 'El modelo mide 183 cm y lleva talla L.',
      composition: '100% algodón French Terry 400gsm.',
      careInstructions: 'Lavar al revés 30°C. No secadora.',
      seoTitle: 'Hoodie Tactical Black | KILLERCLO',
      seoDescription:
        'Hoodie negro 400gsm French Terry. Corte oversize. Killer Club. Envío España.',
    })
    .returning()

  const [hOverdye] = await db
    .insert(schema.products)
    .values({
      slug: 'hoodie-overdye-military',
      name: 'HOODIE — OVERDYE MILITARY',
      description:
        'Base verde military con overdye negro. Resultado: un negro profundo con undertone verde bajo la luz directa. 360gsm. Pieza única en carácter.',
      basePriceCents: 9500,
      categoryId: catHoodies.id,
      isActive: true,
      modelInfo: 'El modelo mide 185 cm y lleva talla M.',
      composition: '100% algodón 360gsm. Proceso overdye doble baño.',
      careInstructions: 'Lavar al revés 30°C fría. No mezclar colores primer lavado.',
      seoTitle: 'Hoodie Overdye Military | KILLERCLO',
      seoDescription:
        'Hoodie verde military overdye negro. 360gsm. Proceso artesanal doble baño. KILLERCLO.',
    })
    .returning()

  const [hClubDeath] = await db
    .insert(schema.products)
    .values({
      slug: 'hoodie-club-death',
      name: 'HOODIE — CLUB DEATH',
      description:
        'Exclusivo Killer Club. 420gsm heavyweight con serigrafía calavera back print. Solo para miembros registrados antes del Drop 001.',
      basePriceCents: 11500,
      categoryId: catHoodies.id,
      dropId: drop001.id,
      isActive: true,
      isMembersOnly: true,
      isFeatured: true,
      modelInfo: 'El modelo mide 185 cm y lleva talla L.',
      composition: '100% algodón heavyweight 420gsm. Serigrafía al agua.',
      careInstructions: 'Lavar al revés 30°C. Planchar al revés temperatura baja.',
      seoTitle: 'Hoodie Club Death — Members Only | KILLERCLO',
      seoDescription:
        'Hoodie exclusivo Killer Club 420gsm. Serigrafía calavera. Solo miembros registrados.',
    })
    .returning()

  // TEES (5)
  const [tKillShot] = await db
    .insert(schema.products)
    .values({
      slug: 'tee-kill-shot',
      name: 'TEE — KILL SHOT',
      description:
        'Camiseta heavyweight 260gsm. Corte boxy con hombros caídos. Serigrafía frontal Kill Shot en blanco roto. Sin concesiones.',
      basePriceCents: 4500,
      categoryId: catTees.id,
      dropId: drop001.id,
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      modelInfo: 'El modelo mide 185 cm y lleva talla M.',
      composition: '100% algodón combed 260gsm.',
      careInstructions: 'Lavar al revés 30°C. No secadora.',
      seoTitle: 'Tee Kill Shot | KILLERCLO Drop 001',
      seoDescription:
        'Camiseta heavyweight 260gsm boxy. Serigrafía Kill Shot. Killer Club Drop 001.',
    })
    .returning()

  const [tSince88] = await db
    .insert(schema.products)
    .values({
      slug: 'tee-since-1988',
      name: 'TEE — SINCE 1988',
      description:
        'La pieza fundacional. "Killer Club Since 1988" en tipografía Oswald condensed en el pecho. 260gsm boxy. Negro absoluto.',
      basePriceCents: 4500,
      categoryId: catTees.id,
      isActive: true,
      isBestSeller: true,
      modelInfo: 'El modelo mide 183 cm y lleva talla L.',
      composition: '100% algodón combed 260gsm.',
      careInstructions: 'Lavar al revés 30°C.',
      seoTitle: 'Tee Since 1988 | KILLERCLO',
      seoDescription:
        'Camiseta Killer Club Since 1988. 260gsm. La pieza fundacional de KILLERCLO.',
    })
    .returning()

  const [tBloodCross] = await db
    .insert(schema.products)
    .values({
      slug: 'tee-blood-cross',
      name: 'TEE — BLOOD CROSS',
      description:
        'Cruz en rojo sangre serigrafía back print. 280gsm long-body. Corte tubular sin costuras laterales.',
      basePriceCents: 4900,
      categoryId: catTees.id,
      isActive: true,
      modelInfo: 'El modelo mide 185 cm y lleva talla M.',
      composition: '100% algodón tubular 280gsm.',
      careInstructions: 'Lavar al revés 30°C. No usar lejía.',
      seoTitle: 'Tee Blood Cross | KILLERCLO',
      seoDescription:
        'Camiseta tubular 280gsm. Cruz roja back print. KILLERCLO.',
    })
    .returning()

  const [tUnderground] = await db
    .insert(schema.products)
    .values({
      slug: 'tee-underground',
      name: 'TEE — UNDERGROUND',
      description:
        'Lettering underground en gris desgastado sobre negro. Remeras reforzadas. 260gsm boxy.',
      basePriceCents: 4900,
      categoryId: catTees.id,
      isActive: true,
      modelInfo: 'El modelo mide 183 cm y lleva talla M.',
      composition: '100% algodón combed 260gsm.',
      careInstructions: 'Lavar al revés 30°C.',
      seoTitle: 'Tee Underground | KILLERCLO',
      seoDescription:
        'Camiseta KILLERCLO Underground. 260gsm boxy. Streetwear Madrid.',
    })
    .returning()

  const [tNoMercy] = await db
    .insert(schema.products)
    .values({
      slug: 'tee-no-mercy',
      name: 'TEE — NO MERCY',
      description:
        'Exclusivo Killer Club. "No Mercy" en crudo sobre negro. 300gsm heavyweight long-body. Solo miembros.',
      basePriceCents: 5500,
      categoryId: catTees.id,
      isActive: true,
      isMembersOnly: true,
      modelInfo: 'El modelo mide 185 cm y lleva talla M.',
      composition: '100% algodón heavyweight 300gsm.',
      careInstructions: 'Lavar al revés 30°C.',
      seoTitle: 'Tee No Mercy — Members Only | KILLERCLO',
      seoDescription:
        'Camiseta KILLERCLO No Mercy. 300gsm. Exclusivo miembros Killer Club.',
    })
    .returning()

  // JACKETS (4)
  const [jFieldOps] = await db
    .insert(schema.products)
    .values({
      slug: 'jacket-field-ops',
      name: 'JACKET — FIELD OPS',
      description:
        'Chaqueta táctica con múltiples bolsillos cargo. Shell ripstop resistente al agua. Forro polar extraíble. Para el campo y para la calle.',
      basePriceCents: 18500,
      categoryId: catJackets.id,
      dropId: drop001.id,
      isActive: true,
      isFeatured: true,
      modelInfo: 'El modelo mide 185 cm y lleva talla M.',
      composition: '100% Nylon ripstop exterior. Forro polar 200g removible.',
      careInstructions: 'Lavar a mano 30°C. No secadora. Reproofing DWR anual.',
      seoTitle: 'Jacket Field Ops | KILLERCLO Drop 001',
      seoDescription:
        'Chaqueta táctica cargo ripstop. Forro polar extraíble. KILLERCLO Drop 001.',
    })
    .returning()

  const [jBomber] = await db
    .insert(schema.products)
    .values({
      slug: 'jacket-bomber-death',
      name: 'JACKET — BOMBER DEATH',
      description:
        'Bomber MA-1 en nylon negro mate. Ribetes en rojo sangre. Interior naranja con serigrafía KILLERCLO. Icónico.',
      basePriceCents: 21500,
      categoryId: catJackets.id,
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      modelInfo: 'El modelo mide 185 cm y lleva talla M.',
      composition: '100% Nylon mate exterior. Forro 100% poliéster.',
      careInstructions: 'Limpieza en seco recomendada. Lavar a mano fría.',
      seoTitle: 'Jacket Bomber Death | KILLERCLO',
      seoDescription:
        'Bomber MA-1 negro mate ribetes rojos. Interior naranja serigrafía. KILLERCLO.',
    })
    .returning()

  const [jRainKiller] = await db
    .insert(schema.products)
    .values({
      slug: 'jacket-rain-killer',
      name: 'JACKET — RAIN KILLER',
      description:
        'Chubasquero técnico sellado. Costuras termoselladas, sin costuras exteriores visibles. 10k/10k waterproofing. Para cuando el cielo cae.',
      basePriceCents: 16500,
      categoryId: catJackets.id,
      isActive: true,
      modelInfo: 'El modelo mide 183 cm y lleva talla L.',
      composition: '2.5L shell técnico. Costuras termoselladas. 10k/10k.',
      careInstructions: 'Lavar a máquina 30°C sin centrifugado. No planchar.',
      seoTitle: 'Jacket Rain Killer | KILLERCLO',
      seoDescription:
        'Chubasquero técnico sellado 10k KILLERCLO. Streetwear lluvia Madrid.',
    })
    .returning()

  const [jCargo] = await db
    .insert(schema.products)
    .values({
      slug: 'jacket-cargo-military',
      name: 'JACKET — CARGO MILITARY',
      description:
        'M65 relecturada. Canvas de algodón encerado con parches KILLERCLO. 8 bolsillos. Cuello alzacuellos. Peso: 900g.',
      basePriceCents: 19500,
      categoryId: catJackets.id,
      isActive: true,
      modelInfo: 'El modelo mide 185 cm y lleva talla L.',
      composition: '100% algodón canvas encerado 400gsm.',
      careInstructions: 'No lavar a máquina. Paño húmedo. Re-wax anual.',
      seoTitle: 'Jacket Cargo Military | KILLERCLO',
      seoDescription:
        'Chaqueta M65 canvas encerado KILLERCLO. 8 bolsillos. 900g. Streetwear militar.',
    })
    .returning()

  // PANTS (3)
  const [pTactical] = await db
    .insert(schema.products)
    .values({
      slug: 'cargo-tactical-wide',
      name: 'CARGO — TACTICAL WIDE',
      description:
        'Pantalón cargo wide leg. 6 bolsillos funcionales. Cintura elástica con cordón. Ripstop ligero 200gsm.',
      basePriceCents: 11500,
      categoryId: catPants.id,
      dropId: drop001.id,
      isActive: true,
      isFeatured: true,
      modelInfo: 'El modelo mide 185 cm y lleva talla M. Tiro alto.',
      composition: '65% algodón, 35% poliéster ripstop 200gsm.',
      careInstructions: 'Lavar 30°C. Planchar temperatura media.',
      seoTitle: 'Cargo Tactical Wide | KILLERCLO Drop 001',
      seoDescription:
        'Pantalón cargo wide leg ripstop. 6 bolsillos. KILLERCLO Drop 001.',
    })
    .returning()

  const [pBlackOps] = await db
    .insert(schema.products)
    .values({
      slug: 'cargo-black-ops',
      name: 'CARGO — BLACK OPS',
      description:
        'Cargo slim. Tejido twill de algodón pesado 280gsm. Bolsillos camuflados. Negro industrial sin reflejos.',
      basePriceCents: 12500,
      categoryId: catPants.id,
      isActive: true,
      isBestSeller: true,
      modelInfo: 'El modelo mide 183 cm y lleva talla M. Tiro medio.',
      composition: '100% algodón twill 280gsm.',
      careInstructions: 'Lavar al revés 30°C.',
      seoTitle: 'Cargo Black Ops | KILLERCLO',
      seoDescription:
        'Cargo slim twill negro 280gsm. KILLERCLO. Streetwear industrial.',
    })
    .returning()

  const [pTrack] = await db
    .insert(schema.products)
    .values({
      slug: 'track-pants-killer',
      name: 'TRACK PANTS — KILLER',
      description:
        'Track pants en tejido técnico ligero. Línea lateral rojo sangre. Ajuste tobillo con cremallera. Corte atlético.',
      basePriceCents: 8900,
      categoryId: catPants.id,
      isActive: true,
      modelInfo: 'El modelo mide 185 cm y lleva talla M.',
      composition: '88% poliéster, 12% elastano técnico.',
      careInstructions: 'Lavar 30°C. No planchar.',
      seoTitle: 'Track Pants Killer | KILLERCLO',
      seoDescription:
        'Track pants técnicos línea roja. Cremallera tobillo. KILLERCLO.',
    })
    .returning()

  // ACCESSORIES (2)
  const [aBeanie] = await db
    .insert(schema.products)
    .values({
      slug: 'beanie-killer-club',
      name: 'BEANIE — KILLER CLUB',
      description:
        'Gorro punto grueso 100% lana merino. Bordado KILLERCLO frontal. Dobladillo doble. Negro mate.',
      basePriceCents: 2500,
      categoryId: catAccessories.id,
      isActive: true,
      isBestSeller: true,
      composition: '100% lana merino 16 mic.',
      careInstructions: 'Lavar a mano agua fría. Secar en plano.',
      seoTitle: 'Beanie Killer Club | KILLERCLO',
      seoDescription:
        'Gorro lana merino bordado KILLERCLO. Negro. Streetwear invierno.',
    })
    .returning()

  const [aTote] = await db
    .insert(schema.products)
    .values({
      slug: 'tote-bag-blood-drop',
      name: 'TOTE BAG — BLOOD DROP',
      description:
        'Tote de canvas 400gsm. Serigrafía gota de sangre en rojo. Asa larga. Resistente.',
      basePriceCents: 3500,
      categoryId: catAccessories.id,
      isActive: true,
      composition: '100% algodón canvas 400gsm.',
      careInstructions: 'Lavar a mano 30°C.',
      seoTitle: 'Tote Bag Blood Drop | KILLERCLO',
      seoDescription:
        'Tote canvas 400gsm serigrafía gota sangre. KILLERCLO.',
    })
    .returning()

  // CAPS (2)
  const [cap6panel] = await db
    .insert(schema.products)
    .values({
      slug: 'cap-killerclo-6panel',
      name: 'CAP — KILLERCLO 6PANEL',
      description:
        '6-panel structured en lona negra. Logo K bordado frontal. Cierre snapback. Visera plana.',
      basePriceCents: 3500,
      categoryId: catCaps.id,
      dropId: drop001.id,
      isActive: true,
      isFeatured: true,
      composition: '100% algodón lona. Visera plana no curva.',
      careInstructions: 'Limpiar con paño húmedo. No lavar a máquina.',
      seoTitle: 'Cap KILLERCLO 6Panel | Drop 001',
      seoDescription:
        '6-panel snapback bordado K. Negro. KILLERCLO Drop 001.',
    })
    .returning()

  const [capDeath] = await db
    .insert(schema.products)
    .values({
      slug: 'cap-death-logo',
      name: 'CAP — DEATH LOGO',
      description:
        '5-panel camp cap en ripstop negro. Serigrafía Death Logo lateral. Cierre ajustable.',
      basePriceCents: 3500,
      categoryId: catCaps.id,
      isActive: true,
      composition: '100% nylon ripstop.',
      careInstructions: 'Limpiar con paño húmedo.',
      seoTitle: 'Cap Death Logo | KILLERCLO',
      seoDescription:
        '5-panel camp cap ripstop. Death Logo serigrafía. KILLERCLO.',
    })
    .returning()

  if (
    !hBloodWash || !hTacticalBlack || !hOverdye || !hClubDeath ||
    !tKillShot || !tSince88 || !tBloodCross || !tUnderground || !tNoMercy ||
    !jFieldOps || !jBomber || !jRainKiller || !jCargo ||
    !pTactical || !pBlackOps || !pTrack ||
    !aBeanie || !aTote ||
    !cap6panel || !capDeath
  ) {
    throw new Error('Product insert failed')
  }

  // ── Product Variants ───────────────────────────────────────────────────────
  console.log('  → variants')

  const variantData: schema.NewProductVariant[] = [
    // HOODIES
    ...variants(hBloodWash.id, 'HBW', clothingSizes, limitedStock),
    ...variants(hTacticalBlack.id, 'HTB', clothingSizes, coreStock),
    ...variants(hOverdye.id, 'HOM', clothingSizes, coreStock),
    ...variants(hClubDeath.id, 'HCD', clothingSizes, soldOutStock),

    // TEES
    ...variants(tKillShot.id, 'TKS', clothingSizes, { XS: 20, S: 30, M: 40, L: 35, XL: 25, XXL: 10 }),
    ...variants(tSince88.id, 'TS88', clothingSizes, coreStock),
    ...variants(tBloodCross.id, 'TBC', clothingSizes, coreStock),
    ...variants(tUnderground.id, 'TUG', clothingSizes, limitedStock),
    ...variants(tNoMercy.id, 'TNM', clothingSizes, { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }),

    // JACKETS
    ...variants(jFieldOps.id, 'JFO', clothingSizes, limitedStock),
    ...variants(jBomber.id, 'JBD', clothingSizes, { XS: 5, S: 8, M: 12, L: 10, XL: 7, XXL: 3 }),
    ...variants(jRainKiller.id, 'JRK', clothingSizes, coreStock),
    ...variants(jCargo.id, 'JCM', clothingSizes, limitedStock),

    // PANTS
    ...variants(pTactical.id, 'PTW', clothingSizes, coreStock),
    ...variants(pBlackOps.id, 'PBO', clothingSizes, coreStock),
    ...variants(pTrack.id, 'PTK', clothingSizes, coreStock),

    // ACCESSORIES — one size
    { productId: aBeanie.id, size: 'OS', sku: 'KLR-ABN-OS', stock: 50, position: 0 },
    { productId: aTote.id, size: 'OS', sku: 'KLR-ATB-OS', stock: 35, position: 0 },

    // CAPS — one size
    { productId: cap6panel.id, size: 'OS', sku: 'KLR-C6P-OS', stock: 20, position: 0 },
    { productId: capDeath.id, size: 'OS', sku: 'KLR-CDL-OS', stock: 15, position: 0 },
  ]

  await db.insert(schema.productVariants).values(variantData)

  // ── Product Images (placeholder URLs — replace with real Supabase Storage) ─
  console.log('  → images (placeholder)')

  const placeholderImages: schema.NewProductImage[] = [
    // Hoodie Blood Wash
    { productId: hBloodWash.id, url: '/images/products/hoodie-blood-wash-front.jpg', alt: 'Hoodie KILLERCLO Blood Wash vista frontal', isPrimary: true, position: 0 },
    { productId: hBloodWash.id, url: '/images/products/hoodie-blood-wash-back.jpg', alt: 'Hoodie KILLERCLO Blood Wash vista trasera', isPrimary: false, position: 1 },
    // Hoodie Tactical Black
    { productId: hTacticalBlack.id, url: '/images/products/hoodie-tactical-black-front.jpg', alt: 'Hoodie KILLERCLO Tactical Black vista frontal', isPrimary: true, position: 0 },
    { productId: hTacticalBlack.id, url: '/images/products/hoodie-tactical-black-back.jpg', alt: 'Hoodie KILLERCLO Tactical Black vista trasera', isPrimary: false, position: 1 },
    // Hoodie Overdye
    { productId: hOverdye.id, url: '/images/products/hoodie-overdye-front.jpg', alt: 'Hoodie KILLERCLO Overdye Military vista frontal', isPrimary: true, position: 0 },
    { productId: hOverdye.id, url: '/images/products/hoodie-overdye-back.jpg', alt: 'Hoodie KILLERCLO Overdye Military vista trasera', isPrimary: false, position: 1 },
    // Hoodie Club Death
    { productId: hClubDeath.id, url: '/images/products/hoodie-club-death-front.jpg', alt: 'Hoodie KILLERCLO Club Death frontal — Members Only', isPrimary: true, position: 0 },
    // Tee Kill Shot
    { productId: tKillShot.id, url: '/images/products/tee-kill-shot-front.jpg', alt: 'Camiseta KILLERCLO Kill Shot vista frontal', isPrimary: true, position: 0 },
    { productId: tKillShot.id, url: '/images/products/tee-kill-shot-back.jpg', alt: 'Camiseta KILLERCLO Kill Shot vista trasera', isPrimary: false, position: 1 },
    // Tee Since 1988
    { productId: tSince88.id, url: '/images/products/tee-since-88-front.jpg', alt: 'Camiseta KILLERCLO Since 1988 frontal', isPrimary: true, position: 0 },
    // Tee Blood Cross
    { productId: tBloodCross.id, url: '/images/products/tee-blood-cross-front.jpg', alt: 'Camiseta KILLERCLO Blood Cross frontal', isPrimary: true, position: 0 },
    { productId: tBloodCross.id, url: '/images/products/tee-blood-cross-back.jpg', alt: 'Camiseta KILLERCLO Blood Cross back print cruz roja', isPrimary: false, position: 1 },
    // Tee Underground
    { productId: tUnderground.id, url: '/images/products/tee-underground-front.jpg', alt: 'Camiseta KILLERCLO Underground frontal', isPrimary: true, position: 0 },
    // Tee No Mercy
    { productId: tNoMercy.id, url: '/images/products/tee-no-mercy-front.jpg', alt: 'Camiseta KILLERCLO No Mercy frontal — Members Only', isPrimary: true, position: 0 },
    // Jacket Field Ops
    { productId: jFieldOps.id, url: '/images/products/jacket-field-ops-front.jpg', alt: 'Chaqueta KILLERCLO Field Ops frontal', isPrimary: true, position: 0 },
    { productId: jFieldOps.id, url: '/images/products/jacket-field-ops-back.jpg', alt: 'Chaqueta KILLERCLO Field Ops trasera', isPrimary: false, position: 1 },
    { productId: jFieldOps.id, url: '/images/products/jacket-field-ops-detail.jpg', alt: 'Chaqueta KILLERCLO Field Ops detalle bolsillos', isPrimary: false, position: 2 },
    // Jacket Bomber
    { productId: jBomber.id, url: '/images/products/jacket-bomber-front.jpg', alt: 'Bomber MA-1 KILLERCLO Death frontal', isPrimary: true, position: 0 },
    { productId: jBomber.id, url: '/images/products/jacket-bomber-interior.jpg', alt: 'Bomber MA-1 KILLERCLO Death interior naranja', isPrimary: false, position: 1 },
    // Jacket Rain Killer
    { productId: jRainKiller.id, url: '/images/products/jacket-rain-killer-front.jpg', alt: 'Chubasquero técnico KILLERCLO Rain Killer frontal', isPrimary: true, position: 0 },
    // Jacket Cargo Military
    { productId: jCargo.id, url: '/images/products/jacket-cargo-military-front.jpg', alt: 'Chaqueta M65 KILLERCLO Cargo Military frontal', isPrimary: true, position: 0 },
    // Cargo Tactical Wide
    { productId: pTactical.id, url: '/images/products/cargo-tactical-wide-front.jpg', alt: 'Cargo KILLERCLO Tactical Wide frontal', isPrimary: true, position: 0 },
    { productId: pTactical.id, url: '/images/products/cargo-tactical-wide-detail.jpg', alt: 'Cargo KILLERCLO Tactical Wide detalle bolsillos', isPrimary: false, position: 1 },
    // Cargo Black Ops
    { productId: pBlackOps.id, url: '/images/products/cargo-black-ops-front.jpg', alt: 'Cargo slim KILLERCLO Black Ops frontal', isPrimary: true, position: 0 },
    // Track Pants
    { productId: pTrack.id, url: '/images/products/track-pants-killer-front.jpg', alt: 'Track Pants KILLERCLO Killer frontal', isPrimary: true, position: 0 },
    // Beanie
    { productId: aBeanie.id, url: '/images/products/beanie-killer-club.jpg', alt: 'Gorro KILLERCLO Killer Club lana merino negro', isPrimary: true, position: 0 },
    // Tote
    { productId: aTote.id, url: '/images/products/tote-blood-drop.jpg', alt: 'Tote Bag KILLERCLO Blood Drop canvas negro', isPrimary: true, position: 0 },
    // Caps
    { productId: cap6panel.id, url: '/images/products/cap-6panel-front.jpg', alt: 'Gorra 6-panel KILLERCLO snapback negro frontal', isPrimary: true, position: 0 },
    { productId: capDeath.id, url: '/images/products/cap-death-logo.jpg', alt: 'Gorra 5-panel KILLERCLO Death Logo lateral', isPrimary: true, position: 0 },
  ]

  await db.insert(schema.productImages).values(placeholderImages)

  // ── Members Box ────────────────────────────────────────────────────────────
  console.log('  → members box')

  await db.insert(schema.membersBoxes).values({
    name: 'MEMBERS BOX VOL. 1',
    priceCents: 8900,
    description:
      'Tres piezas curadas por el equipo KILLERCLO. Hoodie + Tee + Accesorio. El contenido es sorpresa. Siempre por encima del precio.',
    contentsConfig: {
      items: 3,
      categories: ['hoodies', 'tees', 'accessories'],
      surprise: true,
    },
    stock: 50,
    isActive: true,
  })

  // ── Lookbook Posts (placeholder) ───────────────────────────────────────────
  console.log('  → lookbook posts')

  await db.insert(schema.lookbookPosts).values([
    {
      title: 'ON THE STREETS — DROP 001',
      imageUrl: '/images/lookbook/lookbook-01.jpg',
      hotspots: [
        { x: 0.45, y: 0.35, productId: hBloodWash.id },
        { x: 0.52, y: 0.72, productId: pTactical.id },
      ],
      position: 0,
      isActive: true,
    },
    {
      title: 'KILLER CLUB — WINTER 2026',
      imageUrl: '/images/lookbook/lookbook-02.jpg',
      hotspots: [
        { x: 0.38, y: 0.28, productId: jBomber.id },
        { x: 0.55, y: 0.62, productId: pBlackOps.id },
        { x: 0.42, y: 0.08, productId: cap6panel.id },
      ],
      position: 1,
      isActive: true,
    },
    {
      title: 'TACTICAL SERIES',
      imageUrl: '/images/lookbook/lookbook-03.jpg',
      hotspots: [
        { x: 0.35, y: 0.25, productId: jFieldOps.id },
        { x: 0.48, y: 0.78, productId: pTactical.id },
      ],
      position: 2,
      isActive: true,
    },
  ])

  console.log('✅ Seed complete.')
  console.log(`
  Summary:
  ─────────────────────────────
  6   categories
  1   drop (DROP 001 — INITIATION, active)
  20  products (4 hoodies, 5 tees, 4 jackets, 3 pants, 2 accessories, 2 caps)
  ${variantData.length}  variants
  ${placeholderImages.length}  product images (placeholders)
  1   members box (VOL. 1)
  3   lookbook posts
  ─────────────────────────────
  Replace /images/products/* and /images/lookbook/* with real Supabase Storage URLs.
  `)
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => client.end())
