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

export interface IStorage {
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
  
  // Blocks
  getBlocks(): Promise<Block[]>;
  getBlock(id: string): Promise<Block | undefined>;
  createBlock(block: InsertBlock): Promise<Block>;
  updateBlock(id: string, block: Partial<InsertBlock>): Promise<Block>;
  deleteBlock(id: string): Promise<void>;
  
  // Services
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: string): Promise<void>;
  
  // Reviews
  getReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, review: Partial<InsertReview>): Promise<Review>;
  deleteReview(id: string): Promise<void>;
  
  // Requests
  getRequests(): Promise<Request[]>;
  createRequest(request: InsertRequest): Promise<Request>;
  
  // Subscribers
  getSubscribers(): Promise<Subscriber[]>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByChatId(chatId: string): Promise<Subscriber | undefined>;
  
  // Images
  getImages(): Promise<Image[]>;
  createImage(image: InsertImage): Promise<Image>;
  deleteImage(id: string): Promise<void>;
  
  // Auth
  validateAdminPassword(password: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private settings: Settings;
  private blocks: Map<string, Block>;
  private services: Map<string, Service>;
  private reviews: Map<string, Review>;
  private requests: Map<string, Request>;
  private subscribers: Map<string, Subscriber>;
  private images: Map<string, Image>;

  constructor() {
    // Initialize with default data
    this.settings = {
      id: randomUUID(),
      masterName: "Анна Петрова",
      masterPhone: "+7 (950) 123-45-67",
      masterSignature: "Мастер маникюра и nail-дизайна",
      masterDescription: "Создаю красивые и здоровые ногти уже более 5 лет. Индивидуальный подход к каждому клиенту.",
      masterPhoto: null,
      telegramEnabled: false,
      telegramUsername: null,
      whatsappEnabled: false,
      whatsappPhone: null,
      instagramEnabled: false,
      instagramUsername: null,
      botToken: null,
      adminPassword: bcrypt.hashSync("admin123", 10),
    };

    this.blocks = new Map();
    this.services = new Map();
    this.reviews = new Map();
    this.requests = new Map();
    this.subscribers = new Map();
    this.images = new Map();

    // Initialize default blocks
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // About block
    const aboutBlock: Block = {
      id: randomUUID(),
      blockType: "about",
      enabled: true,
      title: "Обо мне",
      content: "Меня зовут Анна, и я занимаюсь nail-индустрией уже более 5 лет. Моя страсть — создавать красивые и здоровые ногти, которые подчеркивают индивидуальность каждой клиентки.",
      image: null,
    };
    this.blocks.set(aboutBlock.id, aboutBlock);

    // Services block
    const servicesBlock: Block = {
      id: randomUUID(),
      blockType: "services",
      enabled: true,
      title: "Мои услуги",
      content: "Профессиональный уход за ногтями с использованием качественных материалов",
      image: null,
    };
    this.blocks.set(servicesBlock.id, servicesBlock);

    // Reviews block
    const reviewsBlock: Block = {
      id: randomUUID(),
      blockType: "reviews",
      enabled: true,
      title: "Отзывы клиентов",
      content: "Что говорят мои клиенты о качестве работы",
      image: null,
    };
    this.blocks.set(reviewsBlock.id, reviewsBlock);

    // Contacts block
    const contactsBlock: Block = {
      id: randomUUID(),
      blockType: "contacts",
      enabled: true,
      title: "Контакты и запись",
      content: "Свяжитесь со мной удобным способом или оставьте заявку",
      image: null,
    };
    this.blocks.set(contactsBlock.id, contactsBlock);

    // Default services
    const defaultServices = [
      { name: "Классический маникюр", description: "Обработка кутикулы, придание формы ногтям, покрытие лаком на выбор", price: "от 1500₽", icon: "💅" },
      { name: "Гель-лак", description: "Стойкое покрытие гель-лаком, которое держится до 3 недель", price: "от 2000₽", icon: "✨" },
      { name: "Nail-дизайн", description: "Художественная роспись, стразы, слайдеры, френч и другие дизайны", price: "от 2500₽", icon: "🎨" },
      { name: "Педикюр", description: "Комплексный уход за стопами и ногтями, обработка огрубевшей кожи", price: "от 2200₽", icon: "🦶" },
      { name: "Укрепление ногтей", description: "Процедуры для восстановления и укрепления тонких, ломких ногтей", price: "от 1800₽", icon: "💪" },
      { name: "Spa-уход", description: "Расслабляющие процедуры для рук: массаж, маски, парафинотерапия", price: "от 1200₽", icon: "💎" },
    ];

    defaultServices.forEach(service => {
      const id = randomUUID();
      this.services.set(id, { id, ...service });
    });
  }

  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<InsertSettings>): Promise<Settings> {
    if (newSettings.adminPassword) {
      newSettings.adminPassword = bcrypt.hashSync(newSettings.adminPassword, 10);
    }
    this.settings = { ...this.settings, ...newSettings };
    return this.settings;
  }

  async getBlocks(): Promise<Block[]> {
    return Array.from(this.blocks.values());
  }

  async getBlock(id: string): Promise<Block | undefined> {
    return this.blocks.get(id);
  }

  async createBlock(block: InsertBlock): Promise<Block> {
    const id = randomUUID();
    const newBlock: Block = { ...block, id };
    this.blocks.set(id, newBlock);
    return newBlock;
  }

  async updateBlock(id: string, updates: Partial<InsertBlock>): Promise<Block> {
    const block = this.blocks.get(id);
    if (!block) throw new Error("Block not found");
    const updatedBlock = { ...block, ...updates };
    this.blocks.set(id, updatedBlock);
    return updatedBlock;
  }

  async deleteBlock(id: string): Promise<void> {
    this.blocks.delete(id);
  }

  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async createService(service: InsertService): Promise<Service> {
    const id = randomUUID();
    const newService: Service = { ...service, id };
    this.services.set(id, newService);
    return newService;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service> {
    const service = this.services.get(id);
    if (!service) throw new Error("Service not found");
    const updatedService = { ...service, ...updates };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: string): Promise<void> {
    this.services.delete(id);
  }

  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = randomUUID();
    const newReview: Review = { 
      ...review, 
      id, 
      createdAt: new Date().toISOString() as any 
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async updateReview(id: string, updates: Partial<InsertReview>): Promise<Review> {
    const review = this.reviews.get(id);
    if (!review) throw new Error("Review not found");
    const updatedReview = { ...review, ...updates };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  async deleteReview(id: string): Promise<void> {
    this.reviews.delete(id);
  }

  async getRequests(): Promise<Request[]> {
    return Array.from(this.requests.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createRequest(request: InsertRequest): Promise<Request> {
    const id = randomUUID();
    const newRequest: Request = { 
      ...request, 
      id, 
      createdAt: new Date().toISOString() as any 
    };
    this.requests.set(id, newRequest);
    return newRequest;
  }

  async getSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const id = randomUUID();
    const newSubscriber: Subscriber = { 
      ...subscriber, 
      id, 
      createdAt: new Date().toISOString() as any 
    };
    this.subscribers.set(id, newSubscriber);
    return newSubscriber;
  }

  async getSubscriberByChatId(chatId: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(sub => sub.chatId === chatId);
  }

  async getImages(): Promise<Image[]> {
    return Array.from(this.images.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createImage(image: InsertImage): Promise<Image> {
    const id = randomUUID();
    const newImage: Image = { 
      ...image, 
      id, 
      createdAt: new Date().toISOString() as any 
    };
    this.images.set(id, newImage);
    return newImage;
  }

  async deleteImage(id: string): Promise<void> {
    this.images.delete(id);
  }

  async validateAdminPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.settings.adminPassword);
  }
}

export const storage = new MemStorage();
