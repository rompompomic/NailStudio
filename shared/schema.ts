import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  masterName: text("master_name").notNull().default("Анна Петрова"),
  masterPhone: text("master_phone").notNull().default("+7 (950) 123-45-67"),
  masterSignature: text("master_signature").notNull().default("Мастер маникюра и nail-дизайна"),
  masterDescription: text("master_description").notNull().default("Создаю красивые и здоровые ногти уже более 5 лет. Индивидуальный подход к каждому клиенту."),
  masterPhoto: text("master_photo"),
  experienceYears: text("experience_years").default("5+"),
  experienceText: text("experience_text").default("лет опыта"),
  satisfiedClients: text("satisfied_clients").default("500+"),
  clientsText: text("clients_text").default("довольных клиентов"),
  telegramEnabled: boolean("telegram_enabled").default(false),
  telegramUsername: text("telegram_username"),
  whatsappEnabled: boolean("whatsapp_enabled").default(false),
  whatsappPhone: text("whatsapp_phone"),
  instagramEnabled: boolean("instagram_enabled").default(false),
  instagramUsername: text("instagram_username"),
  botToken: text("bot_token"),
  copyright: text("copyright").default("© 2024 Все права защищены"),
  adminPassword: text("admin_password").notNull(),
});

export const blocks = pgTable("blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockType: text("block_type").notNull(), // about, services, reviews, contacts
  enabled: boolean("enabled").default(true),
  title: text("title").notNull(),
  content: text("content"),
  image: text("image"),
  images: text("images"), // JSON array of image paths
  stats: text("stats"), // JSON array of statistics
  order: integer("order").default(0), // For ordering blocks
});

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  icon: text("icon").default("💅"),
  image: text("image"), // Путь к изображению услуги
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  text: text("text").notNull(),
  photo: text("photo"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const requests = pgTable("requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  service: text("service").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: text("chat_id").notNull().unique(),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const images = pgTable("images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertBlockSchema = createInsertSchema(blocks).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertRequestSchema = createInsertSchema(requests).omit({ id: true, createdAt: true });
export const insertSubscriberSchema = createInsertSchema(subscribers).omit({ id: true, createdAt: true });
export const insertImageSchema = createInsertSchema(images).omit({ id: true, createdAt: true });

// Types
export type Settings = typeof settings.$inferSelect;
export type Block = typeof blocks.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Request = typeof requests.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type Image = typeof images.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertReview = z.infer<typeof insertRequestSchema>;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type InsertImage = z.infer<typeof insertImageSchema>;
