import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRequestSchema, insertReviewSchema, insertServiceSchema, insertBlockSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
const upload = multer({ 
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
}

async function sendToTelegram(message: string) {
  const settings = await storage.getSettings();
  if (!settings.botToken) {
    console.log('No bot token configured');
    return;
  }

  const subscribers = await storage.getSubscribers();
  if (subscribers.length === 0) {
    console.log('No subscribers found');
    return;
  }

  console.log(`Sending notification to ${subscribers.length} subscribers`);

  for (const subscriber of subscribers) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: subscriber.chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      if (response.ok) {
        console.log(`✅ Message sent to ${subscriber.firstName || subscriber.username || subscriber.chatId}`);
      } else {
        const error = await response.json();
        console.error(`❌ Failed to send message to ${subscriber.chatId}:`, error);
      }
    } catch (error) {
      console.error(`❌ Error sending message to ${subscriber.chatId}:`, error);
    }
  }
}

async function validateAdmin(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const password = authHeader.substring(7);
  const isValid = await storage.validateAdminPassword(password);
  
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Удаление загруженного файла по пути
  app.delete('/api/admin/delete-upload', validateAdmin, async (req, res) => {
    try {
      // Поддержка пути из query и из body
      let filePath = req.query.path;
      if (!filePath || typeof filePath !== 'string') {
        // Если не пришло в query, пробуем взять из body
        if (req.body && typeof req.body.path === 'string') {
          filePath = req.body.path;
        }
      }
      if (!filePath || typeof filePath !== 'string') {
        console.error('Path is required for file deletion:', filePath);
        return res.status(400).json({ message: 'Path is required' });
      }
      // Защита: разрешаем удалять только из папки uploads
      if (!filePath.startsWith('/uploads/')) {
        console.error('Invalid path for file deletion:', filePath);
        return res.status(400).json({ message: 'Invalid path' });
      }
      const absPath = path.join(process.cwd(), filePath);
      let blockId = req.query.blockId || (req.body && req.body.blockId);
      let imageUrl = req.query.imageUrl || (req.body && req.body.imageUrl);
      try {
        await fs.unlink(absPath);
        // Если передан blockId и imageUrl, удаляем ссылку на изображение из блока
        if (blockId && imageUrl) {
          const blocks = await storage.getBlocks();
          const block = blocks.find(b => b.id === blockId);
          if (block && Array.isArray(block.images)) {
            const newImages = block.images.filter(img => img !== imageUrl && img !== filePath);
            await storage.updateBlock(blockId, { images: newImages });
          }
        }
        res.json({ success: true });
      } catch (err) {
        console.error('Failed to delete file:', absPath, err);
        res.status(500).json({ message: 'Failed to delete file', error: String(err) });
      }
    } catch (error) {
      console.error('Unexpected error in delete-upload:', error);
      res.status(500).json({ message: 'Failed to delete file', error: String(error) });
    }
  });
  await ensureUploadDir();

  // Serve uploaded files
  app.use('/uploads', async (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    try {
      await fs.access(filePath);
      res.sendFile(filePath);
    } catch {
      res.status(404).json({ message: 'File not found' });
    }
  });

  // Public routes
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      // Don't expose sensitive data
      const { adminPassword, botToken, ...publicSettings } = settings;
      res.json(publicSettings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get settings' });
    }
  });

  app.get('/api/blocks', async (req, res) => {
    try {
      const blocks = await storage.getBlocks();
      const enabledBlocks = blocks.filter(block => block.enabled);
      res.json(enabledBlocks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get blocks' });
    }
  });

  app.get('/api/services', async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get services' });
    }
  });

  app.get('/api/reviews', async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get reviews' });
    }
  });

  app.post('/api/requests', async (req, res) => {
    try {
      const requestData = insertRequestSchema.parse(req.body);
      const newRequest = await storage.createRequest(requestData);
      
      // Send notification to Telegram
      const message = `
🔔 <b>Новая заявка!</b>

👤 <b>Имя:</b> ${requestData.name}
📞 <b>Телефон:</b> ${requestData.phone}
💅 <b>Услуга:</b> ${requestData.service}
${requestData.comment ? `💬 <b>Комментарий:</b> ${requestData.comment}` : ''}

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
      `.trim();

      await sendToTelegram(message);
      
      res.json(newRequest);
    } catch (error) {
      console.error('Request creation error:', error);
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Admin routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { password } = req.body;
      const isValid = await storage.validateAdminPassword(password);
      
      if (isValid) {
        res.json({ success: true, token: password });
      } else {
        res.status(401).json({ message: 'Invalid password' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.get('/api/admin/settings', validateAdmin, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get settings' });
    }
  });

  app.put('/api/admin/settings', validateAdmin, async (req, res) => {
    try {
      const updatedSettings = await storage.updateSettings(req.body);
      const { adminPassword, ...safeSettings } = updatedSettings;
      res.json(safeSettings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update settings' });
    }
  });

  app.get('/api/admin/blocks', validateAdmin, async (req, res) => {
    try {
      const blocks = await storage.getBlocks();
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get blocks' });
    }
  });

  app.put('/api/admin/blocks/:id', validateAdmin, async (req, res) => {
    try {
      const blockData = insertBlockSchema.partial().parse(req.body);
      const updatedBlock = await storage.updateBlock(req.params.id, blockData);
      res.json(updatedBlock);
    } catch (error) {
      console.error('Error updating block:', error);
      res.status(400).json({ message: 'Failed to update block' });
    }
  });

  app.post('/api/admin/blocks', validateAdmin, async (req, res) => {
    try {
      const blockData = insertBlockSchema.parse(req.body);
      const newBlock = await storage.createBlock(blockData);
      res.json(newBlock);
    } catch (error) {
      console.error('Error creating block:', error);
      res.status(400).json({ message: 'Failed to create block' });
    }
  });

  app.delete('/api/admin/blocks/:id', validateAdmin, async (req, res) => {
    try {
      await storage.deleteBlock(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting block:', error);
      res.status(500).json({ message: 'Failed to delete block' });
    }
  });

  app.get('/api/admin/services', validateAdmin, async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get services' });
    }
  });

  app.post('/api/admin/services', validateAdmin, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const newService = await storage.createService(serviceData);
      res.json(newService);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create service' });
    }
  });

  app.put('/api/admin/services/:id', validateAdmin, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const updatedService = await storage.updateService(req.params.id, serviceData);
      res.json(updatedService);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update service' });
    }
  });

  app.delete('/api/admin/services/:id', validateAdmin, async (req, res) => {
    try {
      await storage.deleteService(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete service' });
    }
  });

  app.get('/api/admin/reviews', validateAdmin, async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get reviews' });
    }
  });

  app.post('/api/admin/reviews', validateAdmin, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const newReview = await storage.createReview(reviewData);
      res.json(newReview);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create review' });
    }
  });

  app.put('/api/admin/reviews/:id', validateAdmin, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.partial().parse(req.body);
      const updatedReview = await storage.updateReview(req.params.id, reviewData);
      res.json(updatedReview);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update review' });
    }
  });

  app.delete('/api/admin/reviews/:id', validateAdmin, async (req, res) => {
    try {
      await storage.deleteReview(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete review' });
    }
  });

  app.get('/api/admin/requests', validateAdmin, async (req, res) => {
    try {
      const requests = await storage.getRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get requests' });
    }
  });

  app.post('/api/admin/upload', validateAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const imageData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
      };

      const newImage = await storage.createImage(imageData);
      res.json(newImage);
    } catch (error) {
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  app.get('/api/admin/images', validateAdmin, async (req, res) => {
    try {
      const images = await storage.getImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get images' });
    }
  });

  app.get('/api/admin/subscribers', validateAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getSubscribers();
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get subscribers' });
    }
  });

  app.delete('/api/admin/subscribers/:id', validateAdmin, async (req, res) => {
    try {
      await storage.deleteSubscriber(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete subscriber' });
    }
  });

  app.post('/api/admin/subscribers', validateAdmin, async (req, res) => {
    try {
      const { chatId, firstName, lastName, username } = req.body;
      
      if (!chatId) {
        return res.status(400).json({ message: 'Chat ID is required' });
      }

      const existingSubscriber = await storage.getSubscriberByChatId(chatId);
      if (existingSubscriber) {
        return res.status(400).json({ message: 'Subscriber already exists' });
      }

      const newSubscriber = await storage.createSubscriber({
        chatId,
        firstName: firstName || null,
        lastName: lastName || null,
        username: username || null,
      });

      res.json(newSubscriber);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create subscriber' });
    }
  });

  app.post('/api/admin/telegram/test', validateAdmin, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      if (!settings.botToken) {
        return res.status(400).json({ message: 'Bot token not configured' });
      }

      const subscribers = await storage.getSubscribers();
      if (subscribers.length === 0) {
        return res.status(400).json({ message: 'No subscribers found' });
      }

      const testMessage = `
🔔 <b>Тестовое уведомление!</b>

Это тестовое сообщение от ${settings.masterName}.
Если вы его получили, значит настройка работает правильно!

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
      `.trim();

      let successCount = 0;
      for (const subscriber of subscribers) {
        try {
          const response = await fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: subscriber.chatId,
              text: testMessage,
              parse_mode: 'HTML'
            })
          });

          if (response.ok) {
            successCount++;
          }
        } catch (error) {
          console.error(`Error sending test message to ${subscriber.chatId}:`, error);
        }
      }

      res.json({ 
        success: true, 
        message: `Отправлено ${successCount} из ${subscribers.length} подписчиков` 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send test message' });
    }
  });

  app.delete('/api/admin/images/:id', validateAdmin, async (req, res) => {
    try {
      const images = await storage.getImages();
      const image = images.find(img => img.id === req.params.id);
      if (image && image.path) {
        const filePath = path.join(process.cwd(), image.path);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.error('Failed to delete file:', error);
        }
      }
      await storage.deleteImage(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete image' });
    }
  });

  // Telegram webhook endpoint
  app.post('/api/webhook/telegram', async (req, res) => {
    try {
      const { message } = req.body;
      
      if (message && message.text === '/start') {
        const chatId = message.chat.id.toString();
        const existingSubscriber = await storage.getSubscriberByChatId(chatId);
        
        if (!existingSubscriber) {
          await storage.createSubscriber({
            chatId,
            username: message.from.username || null,
            firstName: message.from.first_name || null,
            lastName: message.from.last_name || null,
          });
        }
        
        const settings = await storage.getSettings();
        if (settings.botToken) {
          await fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `Добро пожаловать! Теперь вы будете получать уведомления о новых заявках от ${settings.masterName}.`
            })
          });
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ message: 'Webhook failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
