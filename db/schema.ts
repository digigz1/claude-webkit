import {
  pgTable,
  pgSequence,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import {
  relations,
  sql,
  type InferSelectModel,
  type InferInsertModel,
} from 'drizzle-orm'

// ─── SEQUENCES ───────────────────────────────────────────────────────────────

export const memberNumberSeq = pgSequence('member_number_seq', {
  startWith: 1988,
  increment: 1,
  minValue: 1988,
})

export const orderNumberSeq = pgSequence('order_number_seq', {
  startWith: 1,
  increment: 1,
})

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').unique().notNull(),
    name: text('name').notNull(),
    tagline: text('tagline'),
    coverImageUrl: text('cover_image_url'),
    position: integer('position').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('categories_position_idx').on(t.position)],
)

// ─── DROPS ───────────────────────────────────────────────────────────────────

export const drops = pgTable(
  'drops',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').unique().notNull(),
    name: text('name').notNull(),
    description: text('description'),
    coverImageUrl: text('cover_image_url'),
    releaseAt: timestamp('release_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    isActive: boolean('is_active').default(false).notNull(),
    position: integer('position').default(0).notNull(),
  },
  (t) => [
    index('drops_release_at_idx').on(t.releaseAt),
    index('drops_is_active_idx').on(t.isActive),
  ],
)

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').unique().notNull(),
    name: text('name').notNull(),
    description: text('description'),
    basePriceCents: integer('base_price_cents').notNull(),
    currency: text('currency').default('EUR').notNull(),
    categoryId: uuid('category_id').references(() => categories.id),
    dropId: uuid('drop_id').references(() => drops.id),
    isActive: boolean('is_active').default(true).notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    isBestSeller: boolean('is_best_seller').default(false).notNull(),
    isMembersOnly: boolean('is_members_only').default(false).notNull(),
    modelInfo: text('model_info'),
    composition: text('composition'),
    careInstructions: text('care_instructions'),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('products_category_id_idx').on(t.categoryId),
    index('products_drop_id_idx').on(t.dropId),
    index('products_is_active_idx').on(t.isActive),
    index('products_is_featured_idx').on(t.isFeatured),
    index('products_is_best_seller_idx').on(t.isBestSeller),
    index('products_created_at_idx').on(t.createdAt),
  ],
)

// ─── PRODUCT VARIANTS ────────────────────────────────────────────────────────

export const productVariants = pgTable(
  'product_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),
    size: text('size').notNull(),
    color: text('color'),
    sku: text('sku').unique().notNull(),
    stock: integer('stock').default(0).notNull(),
    priceOverrideCents: integer('price_override_cents'),
    position: integer('position').default(0).notNull(),
  },
  (t) => [
    index('variants_product_id_idx').on(t.productId),
    uniqueIndex('variants_sku_unique_idx').on(t.sku),
  ],
)

// ─── PRODUCT IMAGES ──────────────────────────────────────────────────────────

export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),
    url: text('url').notNull(),
    alt: text('alt'),
    position: integer('position').default(0).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
  },
  (t) => [
    index('images_product_id_idx').on(t.productId),
    index('images_is_primary_idx').on(t.isPrimary),
  ],
)

// ─── PROFILES ────────────────────────────────────────────────────────────────

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey(),
    email: text('email').unique().notNull(),
    fullName: text('full_name'),
    phone: text('phone'),
    memberNumber: integer('member_number').unique(),
    memberTier: text('member_tier').default('rookie').notNull(),
    whatsappConsent: boolean('whatsapp_consent').default(false).notNull(),
    marketingConsent: boolean('marketing_consent').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('profiles_email_idx').on(t.email),
    index('profiles_member_number_idx').on(t.memberNumber),
    index('profiles_member_tier_idx').on(t.memberTier),
  ],
)

// ─── ADDRESSES ───────────────────────────────────────────────────────────────

export const addresses = pgTable(
  'addresses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    fullName: text('full_name'),
    line1: text('line1').notNull(),
    line2: text('line2'),
    city: text('city').notNull(),
    state: text('state'),
    postalCode: text('postal_code').notNull(),
    country: text('country').default('ES').notNull(),
    phone: text('phone'),
    isDefault: boolean('is_default').default(false).notNull(),
  },
  (t) => [index('addresses_user_id_idx').on(t.userId)],
)

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: text('order_number').unique().notNull(),
    userId: uuid('user_id').references(() => profiles.id),
    email: text('email').notNull(),
    status: text('status').default('pending').notNull(),
    subtotalCents: integer('subtotal_cents').notNull(),
    shippingCents: integer('shipping_cents').default(0).notNull(),
    taxCents: integer('tax_cents').default(0).notNull(),
    totalCents: integer('total_cents').notNull(),
    currency: text('currency').default('EUR').notNull(),
    stripeSessionId: text('stripe_session_id'),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    shippingAddress: jsonb('shipping_address').$type<ShippingAddress>(),
    billingAddress: jsonb('billing_address').$type<ShippingAddress>(),
    trackingNumber: text('tracking_number'),
    trackingCarrier: text('tracking_carrier'),
    trackingUrl: text('tracking_url'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    shippedAt: timestamp('shipped_at', { withTimezone: true }),
  },
  (t) => [
    index('orders_user_id_idx').on(t.userId),
    index('orders_status_idx').on(t.status),
    index('orders_stripe_session_idx').on(t.stripeSessionId),
    index('orders_created_at_idx').on(t.createdAt),
    index('orders_paid_at_idx').on(t.paidAt),
  ],
)

// ─── ORDER ITEMS ─────────────────────────────────────────────────────────────

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull(),
    variantId: uuid('variant_id').references(() => productVariants.id),
    productName: text('product_name').notNull(),
    variantLabel: text('variant_label').notNull(),
    unitPriceCents: integer('unit_price_cents').notNull(),
    quantity: integer('quantity').notNull(),
    totalCents: integer('total_cents').notNull(),
  },
  (t) => [index('order_items_order_id_idx').on(t.orderId)],
)

// ─── NEWSLETTER SUBSCRIBERS ──────────────────────────────────────────────────

export const newsletterSubscribers = pgTable(
  'newsletter_subscribers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').unique().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    source: text('source'),
    memberNumber: integer('member_number'),
    subscribedAt: timestamp('subscribed_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('newsletter_email_unique_idx').on(t.email),
    index('newsletter_is_active_idx').on(t.isActive),
  ],
)

// ─── MEMBERS BOXES ───────────────────────────────────────────────────────────

export const membersBoxes = pgTable('members_boxes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  priceCents: integer('price_cents').notNull(),
  description: text('description'),
  contentsConfig: jsonb('contents_config').$type<MembersBoxContentsConfig>(),
  stock: integer('stock').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  coverImageUrl: text('cover_image_url'),
})

// ─── LOOKBOOK POSTS ──────────────────────────────────────────────────────────

export const lookbookPosts = pgTable(
  'lookbook_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title'),
    imageUrl: text('image_url').notNull(),
    hotspots: jsonb('hotspots')
      .$type<LookbookHotspot[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    position: integer('position').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('lookbook_position_idx').on(t.position)],
)

// ─── ANALYTICS EVENTS ────────────────────────────────────────────────────────

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(),
    sessionId: text('session_id'),
    userId: uuid('user_id').references(() => profiles.id),
    payload: jsonb('payload').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('events_type_idx').on(t.type),
    index('events_created_at_idx').on(t.createdAt),
    index('events_session_id_idx').on(t.sessionId),
    index('events_user_id_idx').on(t.userId),
  ],
)

// ─── RELATIONS ───────────────────────────────────────────────────────────────

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))

export const dropsRelations = relations(drops, ({ many }) => ({
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  drop: one(drops, {
    fields: [products.dropId],
    references: [drops.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
}))

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  orderItems: many(orderItems),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}))

export const profilesRelations = relations(profiles, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
}))

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(profiles, {
    fields: [addresses.userId],
    references: [profiles.id],
  }),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(profiles, {
    fields: [orders.userId],
    references: [profiles.id],
  }),
  items: many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}))

// ─── JSON SHAPE TYPES ────────────────────────────────────────────────────────

export type ShippingAddress = {
  fullName: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone?: string
}

export type LookbookHotspot = {
  x: number
  y: number
  productId: string
}

export type MembersBoxContentsConfig = {
  items: number
  categories: string[]
  surprise: boolean
}

// ─── INFERRED TABLE TYPES ────────────────────────────────────────────────────

export type Category = InferSelectModel<typeof categories>
export type NewCategory = InferInsertModel<typeof categories>

export type Drop = InferSelectModel<typeof drops>
export type NewDrop = InferInsertModel<typeof drops>

export type Product = InferSelectModel<typeof products>
export type NewProduct = InferInsertModel<typeof products>

export type ProductVariant = InferSelectModel<typeof productVariants>
export type NewProductVariant = InferInsertModel<typeof productVariants>

export type ProductImage = InferSelectModel<typeof productImages>
export type NewProductImage = InferInsertModel<typeof productImages>

export type Profile = InferSelectModel<typeof profiles>
export type NewProfile = InferInsertModel<typeof profiles>

export type Address = InferSelectModel<typeof addresses>
export type NewAddress = InferInsertModel<typeof addresses>

export type Order = InferSelectModel<typeof orders>
export type NewOrder = InferInsertModel<typeof orders>

export type OrderItem = InferSelectModel<typeof orderItems>
export type NewOrderItem = InferInsertModel<typeof orderItems>

export type NewsletterSubscriber = InferSelectModel<typeof newsletterSubscribers>
export type NewNewsletterSubscriber = InferInsertModel<typeof newsletterSubscribers>

export type MembersBox = InferSelectModel<typeof membersBoxes>
export type NewMembersBox = InferInsertModel<typeof membersBoxes>

export type LookbookPost = InferSelectModel<typeof lookbookPosts>
export type NewLookbookPost = InferInsertModel<typeof lookbookPosts>

export type Event = InferSelectModel<typeof events>
export type NewEvent = InferInsertModel<typeof events>

// ─── COMPOSITE API TYPES ─────────────────────────────────────────────────────

export type ProductWithDetails = Product & {
  category: Category | null
  drop: Drop | null
  variants: ProductVariant[]
  images: ProductImage[]
}

export type OrderWithItems = Order & {
  items: Array<OrderItem & { variant: ProductVariant | null }>
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'refunded' | 'cancelled'
export type MemberTier = 'rookie' | 'killer' | 'legend'
export type TrackingCarrier = 'correos' | 'seur' | 'mrw' | 'gls' | 'dhl'
