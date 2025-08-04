import { 
  type Settings, type InsertSettings,
  type Block, type InsertBlock,
  type Service, type InsertService,
  type Review, type InsertReview,
  type Request, type InsertRequest,
  type Subscriber, type InsertSubscriber,
  type Image, type InsertImage
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure data directories exist
async function ensureDataDirs() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// File paths
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const BLOCKS_FILE = path.join(DATA_DIR, "blocks.json");
const SERVICES_FILE = path.join(DATA_DIR, "services.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");
const REQUESTS_FILE = path.join(DATA_DIR, "requests.json");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");
const IMAGES_FILE = path.join(DATA_DIR, "images.json");

// Helper functions for file operations
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export class FileStorage {
  constructor() {
    // ensureDataDirs() is async, so we'll call it when needed
  }

  async getSettings(): Promise<Settings> {
    await ensureDataDirs();
    const defaultSettings: Settings = {
      id: randomUUID(),
      masterName: "Анна Петрова",
      masterPhone: "+7 (950) 123-45-67",
      masterSignature: "Мастер маникюра и nail-дизайна",
      masterDescription: "Создаю красивые и здоровые ногти уже более 5 лет. Индивидуальный подход к каждому клиенту.",
      masterPhoto: null,
      experienceYears: "5+",
      experienceText: "лет опыта",
      satisfiedClients: "500+",
      clientsText: "довольных клиентов",
      telegramEnabled: false,
      telegramUsername: null,
      whatsappEnabled: false,
      whatsappPhone: null,
      instagramEnabled: false,
      instagramUsername: null,
      botToken: null,
      copyright: "© 2024 Все права защищены",
      adminPassword: bcrypt.hashSync("admin123", 10),
    };

    return await readJsonFile(SETTINGS_FILE, defaultSettings);
  }

  async updateSettings(newSettings: Partial<InsertSettings>): Promise<Settings> {
    const currentSettings = await this.getSettings();
    
    // If adminPassword is being updated, hash it
    let updatedSettings = { ...currentSettings, ...newSettings };
    if (newSettings.adminPassword && !newSettings.adminPassword.startsWith('$2b$')) {
      updatedSettings.adminPassword = bcrypt.hashSync(newSettings.adminPassword, 10);
    }
    
    await writeJsonFile(SETTINGS_FILE, updatedSettings);
    return updatedSettings;
  }

  async getBlocks(): Promise<Block[]> {
    await ensureDataDirs();
    const defaultBlocks: Block[] = [
      {
        id: randomUUID(),
        blockType: "about",
        enabled: true,
        title: "Обо мне",
        content: "Меня зовут Анна, и я занимаюсь nail-индустрией уже более 5 лет. Моя страсть — создавать красивые и здоровые ногти, которые подчеркивают индивидуальность каждой клиентки.",
        image: null,
        images: null,
        stats: JSON.stringify([
          { label: "5+", value: "лет опыта" },
          { label: "500+", value: "довольных клиентов" }
        ]),
        order: 0,
      },
      {
        id: randomUUID(),
        blockType: "services",
        enabled: true,
        title: "Мои услуги",
        content: "Профессиональный уход за ногтями с использованием качественных материалов",
        image: null,
        images: null,
        stats: null,
        order: 1,
      },
      {
        id: randomUUID(),
        blockType: "reviews",
        enabled: true,
        title: "Отзывы клиентов",
        content: "Что говорят о моей работе довольные клиентки",
        image: null,
        images: null,
        stats: null,
        order: 2,
      },
      {
        id: randomUUID(),
        blockType: "contacts",
        enabled: true,
        title: "Контакты",
        content: "Свяжитесь со мной для записи на маникюр",
        image: null,
        images: null,
        stats: null,
        order: 3,
      },
    ];

    const blocks = await readJsonFile(BLOCKS_FILE, defaultBlocks);
    
    // If we got default blocks, save them to file
    if (blocks === defaultBlocks) {
      await writeJsonFile(BLOCKS_FILE, defaultBlocks);
    }
    
    return blocks;
  }

  async getBlock(id: string): Promise<Block | undefined> {
    const blocks = await this.getBlocks();
    return blocks.find(block => block.id === id);
  }

  async createBlock(block: InsertBlock): Promise<Block> {
    const blocks = await this.getBlocks();
    const newBlock: Block = { ...block, id: randomUUID() };
    blocks.push(newBlock);
    await writeJsonFile(BLOCKS_FILE, blocks);
    return newBlock;
  }

  async updateBlock(id: string, updates: Partial<InsertBlock>): Promise<Block> {
    const blocks = await this.getBlocks();
    const index = blocks.findIndex(block => block.id === id);
    if (index === -1) {
      throw new Error("Block not found");
    }
    
    blocks[index] = { ...blocks[index], ...updates };
    await writeJsonFile(BLOCKS_FILE, blocks);
    return blocks[index];
  }

  async deleteBlock(id: string): Promise<void> {
    const blocks = await this.getBlocks();
    const filteredBlocks = blocks.filter(block => block.id !== id);
    await writeJsonFile(BLOCKS_FILE, filteredBlocks);
  }

  async getServices(): Promise<Service[]> {
    const defaultServices: Service[] = [
      {
        id: randomUUID(),
        name: "Классический маникюр",
        description: "Базовый уход за ногтями и кутикулой",
        price: "1500",
        icon: "💅",
        image: null,
      },
      {
        id: randomUUID(),
        name: "Покрытие гель-лаком",
        description: "Долговременное покрытие с дизайном",
        price: "2500",
        icon: "✨",
        image: null,
      },
      {
        id: randomUUID(),
        name: "Наращивание ногтей",
        description: "Создание идеальной формы и длины",
        price: "3500",
        icon: "🌟",
        image: null,
      },
    ];

    return await readJsonFile(SERVICES_FILE, defaultServices);
  }

  async createService(service: InsertService): Promise<Service> {
    const services = await this.getServices();
    const newService: Service = { ...service, id: randomUUID() };
    services.push(newService);
    await writeJsonFile(SERVICES_FILE, services);
    return newService;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service> {
    const services = await this.getServices();
    const index = services.findIndex(service => service.id === id);
    if (index === -1) throw new Error("Service not found");
    
    services[index] = { ...services[index], ...updates };
    await writeJsonFile(SERVICES_FILE, services);
    return services[index];
  }

  async deleteService(id: string): Promise<void> {
    const services = await this.getServices();
    const filteredServices = services.filter(service => service.id !== id);
    await writeJsonFile(SERVICES_FILE, filteredServices);
  }

  async getReviews(): Promise<Review[]> {
    return await readJsonFile(REVIEWS_FILE, []);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const reviews = await this.getReviews();
    const newReview: Review = { 
      ...review, 
      id: randomUUID(),
      createdAt: new Date().toISOString() as any
    };
    reviews.unshift(newReview); // Add to beginning
    await writeJsonFile(REVIEWS_FILE, reviews);
    return newReview;
  }

  async updateReview(id: string, updates: Partial<InsertReview>): Promise<Review> {
    const reviews = await this.getReviews();
    const index = reviews.findIndex(review => review.id === id);
    if (index === -1) throw new Error("Review not found");
    
    reviews[index] = { ...reviews[index], ...updates };
    await writeJsonFile(REVIEWS_FILE, reviews);
    return reviews[index];
  }

  async deleteReview(id: string): Promise<void> {
    const reviews = await this.getReviews();
    const filteredReviews = reviews.filter(review => review.id !== id);
    await writeJsonFile(REVIEWS_FILE, filteredReviews);
  }

  async getRequests(): Promise<Request[]> {
    return await readJsonFile(REQUESTS_FILE, []);
  }

  async createRequest(request: InsertRequest): Promise<Request> {
    const requests = await this.getRequests();
    const newRequest: Request = { 
      ...request, 
      id: randomUUID(),
      createdAt: new Date().toISOString() as any
    };
    requests.unshift(newRequest); // Add to beginning
    await writeJsonFile(REQUESTS_FILE, requests);
    return newRequest;
  }

  async getSubscribers(): Promise<Subscriber[]> {
    return await readJsonFile(SUBSCRIBERS_FILE, []);
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const subscribers = await this.getSubscribers();
    const newSubscriber: Subscriber = { 
      ...subscriber, 
      id: randomUUID(),
      createdAt: new Date().toISOString() as any
    };
    subscribers.push(newSubscriber);
    await writeJsonFile(SUBSCRIBERS_FILE, subscribers);
    return newSubscriber;
  }

  async getSubscriberByChatId(chatId: string): Promise<Subscriber | undefined> {
    const subscribers = await this.getSubscribers();
    return subscribers.find(sub => sub.chatId === chatId);
  }

  async deleteSubscriber(id: string): Promise<void> {
    const subscribers = await this.getSubscribers();
    const filteredSubscribers = subscribers.filter(sub => sub.id !== id);
    await writeJsonFile(SUBSCRIBERS_FILE, filteredSubscribers);
  }

  async getImages(): Promise<Image[]> {
    return await readJsonFile(IMAGES_FILE, []);
  }

  async createImage(image: InsertImage): Promise<Image> {
    const images = await this.getImages();
    const newImage: Image = { 
      ...image, 
      id: randomUUID(),
      createdAt: new Date().toISOString() as any
    };
    images.unshift(newImage); // Add to beginning
    await writeJsonFile(IMAGES_FILE, images);
    return newImage;
  }

  async deleteImage(id: string): Promise<void> {
    const images = await this.getImages();
    const image = images.find(img => img.id === id);
    
    if (image) {
      // Delete the actual file
      try {
        const filePath = path.join(process.cwd(), image.path);
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
    
    const filteredImages = images.filter(img => img.id !== id);
    await writeJsonFile(IMAGES_FILE, filteredImages);
  }

  async validateAdminPassword(password: string): Promise<boolean> {
    const settings = await this.getSettings();
    return bcrypt.compare(password, settings.adminPassword);
  }
} 
